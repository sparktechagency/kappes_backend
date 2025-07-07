import { StatusCodes } from 'http-status-codes';
import AppError from '../../../errors/AppError';
import { IJwtPayload } from '../auth/auth.interface';
import { Chat } from '../chat/chat.model';
import { IMessage } from './message.interface';
import { Message } from './message.model';
import { Types } from 'mongoose';
import { USER_ROLES } from '../user/user.enums';
import { ChatParticipantType } from '../chat/chat.enum';
import { Shop } from '../shop/shop.model';
import QueryBuilder from '../../builder/QueryBuilder';

const sendMessageToDB = async (payload: IMessage, user: IJwtPayload): Promise<IMessage> => {
     // find the chat
     const chat = await Chat.findOne({ _id: payload.chatId });
     if (!chat) {
          throw new AppError(StatusCodes.NOT_FOUND, 'Chat not found');
     }
     if (user.role === USER_ROLES.USER) {
          // check user is in chat
          const isUserInChat = chat.participants.some((participant) => {
               participant.participantId.toString() === user.id && participant.participantType === USER_ROLES.USER
          });
          if (!isUserInChat) {
               throw new AppError(StatusCodes.FORBIDDEN, 'User is not in chat');
          }
     }
     const shopId = chat.participants.find((participant) => participant.participantType === ChatParticipantType.SHOP)?.participantId;
     if (!shopId) {
          throw new AppError(StatusCodes.NOT_FOUND, 'Shop not found');
     }
     // find shop
     const shop = await Shop.findOne({ _id: shopId, isActive: true });
     if (!shop) {
          throw new AppError(StatusCodes.NOT_FOUND, "Shop not Found");
     }

     // check verndor or shop admins authorization
     if (user.role === USER_ROLES.VENDOR || user.role === USER_ROLES.SHOP_ADMIN) {
          if (shop.owner.toString() !== user.id && !shop.admins?.some(admin => admin.toString() === user.id)) {
               throw new AppError(StatusCodes.FORBIDDEN, 'You are not authorized to update this order');
          }
     }
     // save to DB
     const response = await Message.create(payload);

     //@ts-ignore
     const io = global.io;
     if (io) {
          io.emit(`getMessage::${payload?.chatId}`, response);
     }

     return response;
};

const getMessageByChatIdFromDB = async (id: Types.ObjectId, query: Record<string, unknown>): Promise<{ meta: any; messages: IMessage[] }> => {
     const queryBuilder = new QueryBuilder(Message.find({ chatId: id }).sort({ createdAt: -1 }), query);
     const messages = await queryBuilder.modelQuery.exec();
     const meta = await queryBuilder.countTotal();
     if (!messages.length) {
          throw new AppError(StatusCodes.NOT_FOUND, 'Messages not found');
     }
     return { meta, messages };
};

export const MessageService = { sendMessageToDB, getMessageByChatIdFromDB };
