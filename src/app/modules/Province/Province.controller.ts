import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { ProvinceService } from './Province.service';

const createProvince = catchAsync(async (req: Request, res: Response) => {
     const result = await ProvinceService.createProvince(req.body);

     sendResponse(res, {
          statusCode: 200,
          success: true,
          message: 'Province created successfully',
          data: result,
     });
});

const getAllProvinces = catchAsync(async (req: Request, res: Response) => {
     const result = await ProvinceService.getAllProvinces(req.query);

     sendResponse(res, {
          statusCode: 200,
          success: true,
          message: 'Provinces retrieved successfully',
          data: result,
     });
});

const getAllUnpaginatedProvinces = catchAsync(async (req: Request, res: Response) => {
     const result = await ProvinceService.getAllUnpaginatedProvinces();

     sendResponse(res, {
          statusCode: 200,
          success: true,
          message: 'Provinces retrieved successfully',
          data: result,
     });
});

const updateProvince = catchAsync(async (req: Request, res: Response) => {
     const { id } = req.params;
     const result = await ProvinceService.updateProvince(id, req.body);

     sendResponse(res, {
          statusCode: 200,
          success: true,
          message: 'Province updated successfully',
          data: result || undefined,
     });
});

const deleteProvince = catchAsync(async (req: Request, res: Response) => {
     const { id } = req.params;
     const result = await ProvinceService.deleteProvince(id);

     sendResponse(res, {
          statusCode: 200,
          success: true,
          message: 'Province deleted successfully',
          data: result || undefined,
     });
});

const hardDeleteProvince = catchAsync(async (req: Request, res: Response) => {
     const { id } = req.params;
     const result = await ProvinceService.hardDeleteProvince(id);

     sendResponse(res, {
          statusCode: 200,
          success: true,
          message: 'Province deleted successfully',
          data: result || undefined,
     });
});

const getProvinceById = catchAsync(async (req: Request, res: Response) => {
     const { id } = req.params;
     const result = await ProvinceService.getProvinceById(id);

     sendResponse(res, {
          statusCode: 200,
          success: true,
          message: 'Province retrieved successfully',
          data: result || undefined,
     });
});  

export const ProvinceController = {
     createProvince,
     getAllProvinces,
     getAllUnpaginatedProvinces,
     updateProvince,
     deleteProvince,
     hardDeleteProvince,
     getProvinceById
};
