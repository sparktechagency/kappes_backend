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

// const getAllUnpaginatedChitChatShipments = catchAsync(async (req: Request, res: Response) => {
//      const result = await chitChatShipmentService.getAllUnpaginatedChitChatShipments();

//      sendResponse(res, {
//           statusCode: 200,
//           success: true,
//           message: 'ChitChatShipments retrieved successfully',
//           data: result,
//      });
// });

// const updateChitChatShipment = catchAsync(async (req: Request, res: Response) => {
//      const { id } = req.params;
//      const result = await chitChatShipmentService.updateChitChatShipment(id, req.body);

//      sendResponse(res, {
//           statusCode: 200,
//           success: true,
//           message: 'ChitChatShipment updated successfully',
//           data: result || undefined,
//      });
// });

// const deleteChitChatShipment = catchAsync(async (req: Request, res: Response) => {
//      const { id } = req.params;
//      const result = await chitChatShipmentService.deleteChitChatShipment(id);

//      sendResponse(res, {
//           statusCode: 200,
//           success: true,
//           message: 'ChitChatShipment deleted successfully',
//           data: result || undefined,
//      });
// });

const hardDeleteChitChatShipment = catchAsync(async (req: Request, res: Response) => {
     const { id } = req.params;
     const result = await chitChatShipmentService.hardDeleteChitChatShipment(id);

     sendResponse(res, {
          statusCode: 200,
          success: true,
          message: 'ChitChatShipment deleted successfully',
          data: result || undefined,
     });
});

const getChitChatShipmentById = catchAsync(async (req: Request, res: Response) => {
     const { id } = req.params;
     const result = await chitChatShipmentService.getChitChatShipmentById(id);

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
     // getAllUnpaginatedChitChatShipments,
     // updateChitChatShipment,
     // deleteChitChatShipment,
     hardDeleteChitChatShipment,
     getChitChatShipmentById
};
