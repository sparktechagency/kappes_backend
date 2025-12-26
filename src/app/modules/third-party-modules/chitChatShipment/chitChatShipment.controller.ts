// src/app/modules/third-party-modules/chitChatShipment/chitChatShipment.controller.ts
import { Request, Response } from 'express';
import catchAsync from '../../../../shared/catchAsync';
import sendResponse from '../../../../shared/sendResponse';
import { chitChatShipmentService } from './chitChatShipment.service';

// Create a new shipment
const createShipment = catchAsync(async (req: Request, res: Response) => {
     const result = await chitChatShipmentService.createShipment(req.body);
     sendResponse(res, {
          statusCode: 201,
          success: true,
          message: 'Shipment created successfully',
          data: result,
     });
});

// List all shipments with optional filters
const buyShipment = catchAsync(async (req: Request, res: Response) => {
     const result = await chitChatShipmentService.buyShipment(req.params.shipmentId, req.body);
     sendResponse(res, {
          statusCode: 200,
          success: true,
          message: 'Shipments finally successfully',
          data: result,
     });
});

const listShipments = catchAsync(async (req: Request, res: Response) => {
     const result = await chitChatShipmentService.listShipments(req.query);
     sendResponse(res, {
          statusCode: 200,
          success: true,
          message: 'Shipments retrieved successfully',
          data: result,
     });
});

// Get a single shipment by ID
const getShipment = catchAsync(async (req: Request, res: Response) => {
     const { shipmentId } = req.params;
     const result = await chitChatShipmentService.getShipment(shipmentId);
     sendResponse(res, {
          statusCode: 200,
          success: true,
          message: 'Shipment retrieved successfully',
          data: result,
     });
});

// Update a shipment
const updateShipment = catchAsync(async (req: Request, res: Response) => {
     const { shipmentId } = req.params;
     const result = await chitChatShipmentService.updateShipment(shipmentId, req.body);
     sendResponse(res, {
          statusCode: 200,
          success: true,
          message: 'Shipment updated successfully',
          data: result,
     });
});

// Delete a shipment
const deleteShipment = catchAsync(async (req: Request, res: Response) => {
     const { shipmentId } = req.params;
     await chitChatShipmentService.deleteShipment(shipmentId);
     sendResponse(res, {
          statusCode: 200,
          success: true,
          message: 'Shipment deleted successfully',
          data: null,
     });
});

// Delete a shipment
const refundShipment = catchAsync(async (req: Request, res: Response) => {
     const { shipmentId } = req.params;
     await chitChatShipmentService.refundShipment(shipmentId);
     sendResponse(res, {
          statusCode: 200,
          success: true,
          message: 'Shipment deleted successfully',
          data: null,
     });
});

// Buy a shipping label for a shipment
// const buyShipment = catchAsync(async (req: Request, res: Response) => {
//      const { shipmentId } = req.params;
//      const result = await chitChatShipmentService.buyShipment(shipmentId);
//      sendResponse(res, {
//           statusCode: 200,
//           success: true,
//           message: 'Shipping label purchased successfully',
//           data: result,
//      });
// });

// Cancel a shipment
const cancelShipment = catchAsync(async (req: Request, res: Response) => {
     const { shipmentId } = req.params;
     const result = await chitChatShipmentService.cancelShipment(shipmentId);
     sendResponse(res, {
          statusCode: 200,
          success: true,
          message: 'Shipment cancelled successfully',
          data: result,
     });
});

// Print a shipping label
const printShipment = catchAsync(async (req: Request, res: Response) => {
     const { shipmentId } = req.params;
     const { format = 'PDF' } = req.body;
     const result = await chitChatShipmentService.printShipment(shipmentId, format);
     sendResponse(res, {
          statusCode: 200,
          success: true,
          message: 'Label printed successfully',
          data: result,
     });
});

// Get a shipping label
const getShipmentLabel = catchAsync(async (req: Request, res: Response) => {
     const { shipmentId } = req.params;
     const { format = 'PDF' } = req.query;
     const result = await chitChatShipmentService.getShipmentLabel(shipmentId, format as string);
     sendResponse(res, {
          statusCode: 200,
          success: true,
          message: 'Label retrieved successfully',
          data: result,
     });
});

// Get tracking information for a shipment
const getShipmentTracking = catchAsync(async (req: Request, res: Response) => {
     const { shipmentId } = req.params;
     const result = await chitChatShipmentService.getShipmentTracking(shipmentId);
     sendResponse(res, {
          statusCode: 200,
          success: true,
          message: 'Tracking information retrieved successfully',
          data: result,
     });
});

export const chitChatShipmentController = {
     createShipment,
     listShipments,
     getShipment,
     updateShipment,
     deleteShipment,
     buyShipment,
     cancelShipment,
     refundShipment,
     printShipment,
     getShipmentLabel,
     getShipmentTracking,
};
