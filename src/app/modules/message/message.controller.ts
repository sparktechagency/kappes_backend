import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';
import { MessageService } from './message.service';
import { IJwtPayload } from '../auth/auth.interface';
import { Types } from 'mongoose';

const sendMessage = catchAsync(async (req: Request, res: Response) => {

     const payload = {
          ...req.body,
          sender: (req.user as IJwtPayload).id,
     };

     const message = await MessageService.sendMessageToDB(payload,req.user as IJwtPayload);
     sendResponse(res, {
          statusCode: StatusCodes.OK,
          success: true,
          message: 'Send Message Successfully',
          data: message,
     });
});

const getMessageByChatId = catchAsync(async (req: Request, res: Response) => {
     const id = new Types.ObjectId(req.params.id);
     const messages = await MessageService.getMessageByChatIdFromDB(id, req.query,req.user as IJwtPayload);
     sendResponse(res, {
          statusCode: StatusCodes.OK,
          success: true,
          message: 'Message Retrieve Successfully',
          data: messages,
     });
});

export const MessageController = { sendMessage, getMessageByChatId };
