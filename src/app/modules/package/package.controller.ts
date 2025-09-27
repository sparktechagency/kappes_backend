import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';
import { PackageService } from './package.service';

const createPackage = catchAsync(async (req: Request, res: Response) => {
  const result = await PackageService.createPackage(req.body);
  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: 'Package created successfully',
    data: result,
  });
});

const getAllPackages = catchAsync(async (req: Request, res: Response) => {
  const query = req.query;
  const result = await PackageService.getAllPackages(query);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Packages fetched successfully',
    data: result,
  });
});

const getPackageById = catchAsync(async (req: Request, res: Response) => {
  const result = await PackageService.getPackageById(req.params.id);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Package fetched successfully',
    data: result,
  });
});

const updatePackage = catchAsync(async (req: Request, res: Response) => {
  const result = await PackageService.updatePackage(req.params.id, req.body);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Package updated successfully',
    data: result,
  });
});

const deletePackage = catchAsync(async (req: Request, res: Response) => {
  const result = await PackageService.deletePackage(req.params.id);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Package deleted successfully',
    data: result,
  });
});

export const PackageController = {
  createPackage,
  getAllPackages,
  getPackageById,
  updatePackage,
  deletePackage,
};
