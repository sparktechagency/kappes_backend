import { Request, Response } from 'express';
import catchAsync from '../../../../shared/catchAsync';
import sendResponse from '../../../../shared/sendResponse';
import { chitChatShipmentService } from './chitChatShipment.service';

const createChitChatShipment = catchAsync(async (req: Request, res: Response) => {
     const result = await chitChatShipmentService.createChitChatShipment(req.body);

     sendResponse(res, {
          statusCode: 200,
          success: true,
          message: 'ChitChatShipment created successfully',
          data: result,
     });
});

const getAllChitChatShipments = catchAsync(async (req: Request, res: Response) => {
     const result = await chitChatShipmentService.getAllChitChatShipments(req.query);

     sendResponse(res, {
          statusCode: 200,
          success: true,
          message: 'ChitChatShipments retrieved successfully',
          data: result,
     });
});


const hardDeleteChitChatShipmentByShipMentId = catchAsync(async (req: Request, res: Response) => {
     const { shipMentId } = req.params;
     const result = await chitChatShipmentService.hardDeleteChitChatShipmentByShipMentId(shipMentId);

     sendResponse(res, {
          statusCode: 200,
          success: true,
          message: 'ChitChatShipment deleted successfully',
          data: result || undefined,
     });
});

const getChitChatShipmentByShipMentId = catchAsync(async (req: Request, res: Response) => {
     const { shipMentId } = req.params;
     const result = await chitChatShipmentService.getChitChatShipmentByShipMentId(shipMentId);

     sendResponse(res, {
          statusCode: 200,
          success: true,
          message: 'ChitChatShipment retrieved successfully',
          data: result || undefined,
     });
});  

export const chitChatShipmentController = {
     createChitChatShipment,
     getAllChitChatShipments,
     hardDeleteChitChatShipmentByShipMentId,
     getChitChatShipmentByShipMentId
};
