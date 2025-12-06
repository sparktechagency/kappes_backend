import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { activitiesRecordHistoryService } from './activitiesRecordHistory.service';

const createActivitiesRecordHistory = catchAsync(async (req: Request, res: Response) => {
     const result = await activitiesRecordHistoryService.createActivitiesRecordHistory(req.body);

     sendResponse(res, {
          statusCode: 200,
          success: true,
          message: 'ActivitiesRecordHistory created successfully',
          data: result,
     });
});

const getAllActivitiesRecordHistorys = catchAsync(async (req: Request, res: Response) => {
     const result = await activitiesRecordHistoryService.getAllActivitiesRecordHistorys(req.query);

     sendResponse(res, {
          statusCode: 200,
          success: true,
          message: 'ActivitiesRecordHistorys retrieved successfully',
          data: result,
     });
});

const getAllUnpaginatedActivitiesRecordHistorys = catchAsync(async (req: Request, res: Response) => {
     const result = await activitiesRecordHistoryService.getAllUnpaginatedActivitiesRecordHistorys();

     sendResponse(res, {
          statusCode: 200,
          success: true,
          message: 'ActivitiesRecordHistorys retrieved successfully',
          data: result,
     });
});

const updateActivitiesRecordHistory = catchAsync(async (req: Request, res: Response) => {
     const { id } = req.params;
     const result = await activitiesRecordHistoryService.updateActivitiesRecordHistory(id, req.body);

     sendResponse(res, {
          statusCode: 200,
          success: true,
          message: 'ActivitiesRecordHistory updated successfully',
          data: result || undefined,
     });
});

const deleteActivitiesRecordHistory = catchAsync(async (req: Request, res: Response) => {
     const { id } = req.params;
     const result = await activitiesRecordHistoryService.deleteActivitiesRecordHistory(id);

     sendResponse(res, {
          statusCode: 200,
          success: true,
          message: 'ActivitiesRecordHistory deleted successfully',
          data: result || undefined,
     });
});

const hardDeleteActivitiesRecordHistory = catchAsync(async (req: Request, res: Response) => {
     const { id } = req.params;
     const result = await activitiesRecordHistoryService.hardDeleteActivitiesRecordHistory(id);

     sendResponse(res, {
          statusCode: 200,
          success: true,
          message: 'ActivitiesRecordHistory deleted successfully',
          data: result || undefined,
     });
});

const getActivitiesRecordHistoryById = catchAsync(async (req: Request, res: Response) => {
     const { id } = req.params;
     const result = await activitiesRecordHistoryService.getActivitiesRecordHistoryById(id);

     sendResponse(res, {
          statusCode: 200,
          success: true,
          message: 'ActivitiesRecordHistory retrieved successfully',
          data: result || undefined,
     });
});  

export const activitiesRecordHistoryController = {
     createActivitiesRecordHistory,
     getAllActivitiesRecordHistorys,
     getAllUnpaginatedActivitiesRecordHistorys,
     updateActivitiesRecordHistory,
     deleteActivitiesRecordHistory,
     hardDeleteActivitiesRecordHistory,
     getActivitiesRecordHistoryById
};
