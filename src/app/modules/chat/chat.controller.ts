import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';
import { ChatService } from './chat.service';
import { IJwtPayload } from '../auth/auth.interface';

const createChat = catchAsync(async (req: Request, res: Response) => {
     const chat = await ChatService.createChatToDB(req.body.participants);

     sendResponse(res, {
          statusCode: StatusCodes.OK,
          success: true,
          message: 'Create Chat Successfully',
          data: chat,
     });
});

const getChatForUser = catchAsync(async (req: Request, res: Response) => {
     const chatList = await ChatService.getChatForUserFromDB(req.user,req.query);

     sendResponse(res, {
          statusCode: StatusCodes.OK,
          success: true,
          message: 'Chat Retrieve Successfully',
          data: chatList,
     });
});

const getChatForShopAdminOrOwner = catchAsync(async (req: Request, res: Response) => {
     const chatList = await ChatService.getChatForShopAdminOrOwnerFromDB(req.user as IJwtPayload,req.query,req.params.id);

     sendResponse(res, {
          statusCode: StatusCodes.OK,
          success: true,
          message: 'Chat Retrieve Successfully',
          data: chatList,
     });
});

export const ChatController = {
     createChat,
     getChatForUser,
     getChatForShopAdminOrOwner,
};
