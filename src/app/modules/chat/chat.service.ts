import { StatusCodes } from 'http-status-codes';
import AppError from '../../../errors/AppError';
import QueryBuilder from '../../builder/QueryBuilder';
import { Message } from '../message/message.model';
import { Shop } from '../shop/shop.model';
import { USER_ROLES } from '../user/user.enums';
import { User } from '../user/user.model';
import { IChat } from './chat.interface';
import { Chat } from './chat.model';
import { Types } from 'mongoose';
import { IJwtPayload } from '../auth/auth.interface';

const createChatToDB = async (payload: { participantId: Types.ObjectId; participantType: string }[]): Promise<IChat> => {
     const users: Types.ObjectId[] = [];
     const shops: Types.ObjectId[] = [];
     for (const participant of payload) {
          if (participant.participantType === 'User') {
               users.push(participant.participantId);
          } else if (participant.participantType === 'Shop') {
               shops.push(participant.participantId);
          }
     }
     const areAllUsersPresent = (await User.countDocuments({ _id: { $in: users }, role: USER_ROLES.USER })) === users.length;
     const areAllShopsPresent = (await Shop.countDocuments({ _id: { $in: shops } })) === shops.length;
     if (!areAllUsersPresent || !areAllShopsPresent) {
          throw new Error('Some participants are not present in the User or Shop collection');
     }
     const isExistChat: IChat | null = await Chat.findOne({
          'participants.participantId': { $all: payload.map(({ participantId }) => participantId) },
          'participants.participantType': { $all: payload.map(({ participantType }) => participantType) },
     });

     if (isExistChat) {
          // populate participants
          const populatedChat = await Chat.populate(isExistChat, {
               path: 'participants.participantId',
               // select: 'name email role',
          });
          return populatedChat;
     }
     const chat: IChat = await Chat.create({ participants: payload });
     if (!chat) {
          throw new AppError(StatusCodes.NOT_FOUND, 'Chat not created');
     }
     // populate participants
     const populatedChat = await Chat.populate(chat, {
          path: 'participants.participantId',
          // select: 'name email role',
     });
     return populatedChat;
};

// const getChatForUserFromDB = async (user: any, query: Record<string, unknown>) => {
//      // 1. Build base chat query (chats where user is a participant)
//      const queryBuilder = new QueryBuilder(Chat.find({ 'participants.participantId': user.id }).populate('participants.participantId','full_name image name logo'), query);

//      // 2. Apply filters, pagination, etc.
//      const chats = await queryBuilder
//           .filter()
//           .sort()
//           .paginate()
//           .fields()
//           .modelQuery.lean() // optional: convert Mongoose documents to plain objects
//           .exec();

//      const meta = await queryBuilder.countTotal();

//      if (chats.length === 0) {
//           return { meta, chats: [] };
//      }

//      const chatIds = chats.map((chat) => chat._id);

//      // 3. Aggregate latest message for each chat
//      const lastMessages = await Message.aggregate([
//           { $match: { chatId: { $in: chatIds } } },
//           { $sort: { createdAt: -1 } },
//           {
//                $group: {
//                     _id: '$chatId',
//                     lastMessage: { $first: '$$ROOT' },
//                },
//           },
//      ]);

//      const lastMessageMap = new Map(lastMessages.map((msg) => [String(msg._id), msg.lastMessage]));

//      // 4. Attach last message to each chat
//      const chatsWithLastMessage = chats.map((chat) => ({
//           ...chat,
//           lastMessage: lastMessageMap.get(String(chat._id)) || null,
//      }));

//      return { meta, chats: chatsWithLastMessage };
// };

const getChatForUserFromDB = async (user: any, query: Record<string, unknown>) => {
     // 1. Build base chat query (chats where user is a participant)
     const queryBuilder = new QueryBuilder(Chat.find({ 'participants.participantId': user.id }).populate('participants.participantId', 'full_name image name logo'), query);

     // 2. Apply filters, pagination, etc.
     const chats = await queryBuilder
          .filter()
          .sort()
          .paginate()
          .fields()
          .modelQuery.lean() // optional: convert Mongoose documents to plain objects
          .exec();

     const meta = await queryBuilder.countTotal();

     if (chats.length === 0) {
          return { meta, chats: [] };
     }

     const chatIds = chats.map((chat) => chat._id);

     // 3. Aggregate latest message for each chat
     const lastMessages = await Message.aggregate([
          { $match: { chatId: { $in: chatIds } } },
          { $sort: { createdAt: -1 } },
          {
               $group: {
                    _id: '$chatId',
                    lastMessage: { $first: '$$ROOT' }, // Get the most recent message for each chat
               },
          },
          {
               $lookup: {
                    from: 'users', // The name of the users collection
                    localField: 'lastMessage.sender', // The sender field in the message
                    foreignField: '_id', // Match the sender's ID with the user's _id
                    as: 'senderDetails', // Name of the array to store sender details
               },
          },
          {
               $unwind: {
                    path: '$senderDetails',
                    preserveNullAndEmptyArrays: true, // If there is no sender, keep it as null
               },
          },
          {
               $project: {
                    _id: 1,
                    lastMessage: 1,
                    senderDetails: {
                         full_name: 1, // Only select the `full_name` and `image`
                         image: 1,
                    },
               },
          },
     ]);

     // Map the results into a Map by chatId, so we can easily add it to the chats
     const lastMessageMap = new Map(lastMessages.map((msg) => [String(msg._id), { ...msg.lastMessage, senderDetails: msg.senderDetails }]));

     // 4. Attach the last message along with the sender details (full_name and image) to each chat
     const chatsWithLastMessage = chats.map((chat) => {
          const lastMessage = lastMessageMap.get(String(chat._id)) || null;
          return {
               ...chat,
               lastMessage, // Include the last message along with sender details
          };
     });

     return { meta, chats: chatsWithLastMessage };
};

const getChatForShopAdminOrOwnerFromDB = async (user: IJwtPayload, query: Record<string, unknown>, shopId: string) => {
     // 1. Build base chat query (chats where user is a participant)
     const queryBuilder = new QueryBuilder(Chat.find({ 'participants.participantId': shopId }).populate('participants.participantId', 'full_name image name logo'), query);

     // 2. Apply filters, pagination, etc.
     const chats = await queryBuilder
          .filter()
          .sort()
          .paginate()
          .fields()
          .modelQuery.lean() // optional: convert Mongoose documents to plain objects
          .exec();

     const meta = await queryBuilder.countTotal();

     if (chats.length === 0) {
          return { meta, chats: [] };
     }

     const chatIds = chats.map((chat) => chat._id);

     // 3. Aggregate latest message for each chat
     const lastMessages = await Message.aggregate([
          { $match: { chatId: { $in: chatIds } } },
          { $sort: { createdAt: -1 } },
          {
               $group: {
                    _id: '$chatId',
                    lastMessage: { $first: '$$ROOT' }, // Get the most recent message for each chat
               },
          },
          {
               $lookup: {
                    from: 'users', // The name of the users collection
                    localField: 'lastMessage.sender', // The sender field in the message
                    foreignField: '_id', // Match the sender's ID with the user's _id
                    as: 'senderDetails', // Name of the array to store sender details
               },
          },
          {
               $unwind: {
                    path: '$senderDetails',
                    preserveNullAndEmptyArrays: true, // If there is no sender, keep it as null
               },
          },
          {
               $project: {
                    _id: 1,
                    lastMessage: 1,
                    senderDetails: {
                         full_name: 1, // Only select the `full_name` and `image`
                         image: 1,
                    },
               },
          },
     ]);

     // Map the results into a Map by chatId, so we can easily add it to the chats
     const lastMessageMap = new Map(lastMessages.map((msg) => [String(msg._id), { ...msg.lastMessage, senderDetails: msg.senderDetails }]));

     // 4. Attach the last message along with the sender details (full_name and image) to each chat
     const chatsWithLastMessage = chats.map((chat) => {
          const lastMessage = lastMessageMap.get(String(chat._id)) || null;
          return {
               ...chat,
               lastMessage, // Include the last message along with sender details
          };
     });

     return { meta, chats: chatsWithLastMessage };
};

// const getChatForShopAdminOrOwnerFromDB = async (user: IJwtPayload, query: Record<string, unknown>, shopId: string) => {
//      // find shop
//      const shop = await Shop.findOne({ _id: new Types.ObjectId(shopId), isActive: true });
//      if (!shop) {
//           throw new AppError(StatusCodes.NOT_FOUND, 'Shop not Found');
//      }

//      // check verndor or shop admins authorization
//      if (user.role === USER_ROLES.USER || user.role === USER_ROLES.SHOP_ADMIN || user.role === USER_ROLES.VENDOR) {
//           if (shop.owner.toString() !== user.id && !shop.admins?.some((admin) => admin.toString() === user.id)) {
//                throw new AppError(StatusCodes.FORBIDDEN, 'You are not authorized to update this order');
//           }
//      }
//      const queryBuilder = new QueryBuilder(
//           Chat.find({ 'participants.participantType': 'Shop', 'participants.participantId': shop._id }).populate('participants.participantId', 'full_name image name logo'),
//           query,
//      );

//      const chats = await queryBuilder.filter().sort().paginate().fields().modelQuery.exec();
//      const meta = await queryBuilder.countTotal();

//      return { meta, chats };
// };

export const ChatService = { createChatToDB, getChatForUserFromDB, getChatForShopAdminOrOwnerFromDB };
