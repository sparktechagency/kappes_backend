import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { IJwtPayload } from "../auth/auth.interface";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { OfferedService } from "./offered.service";

const createOffered = catchAsync(async (req: Request, res: Response) => {
  const result = await OfferedService.createOffered(
    req.body,
    req.user as IJwtPayload
  );

  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: 'Offered created succesfully',
    data: result,
  });
});

const getActiveOfferedService = catchAsync(async (req: Request, res: Response) => {
  const result = await OfferedService.getActiveOfferedService(
    req.query
  );

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Offered fetched succesfully',
    data: result
  });
});

const getAllOffered = catchAsync(async (req: Request, res: Response) => {
  const result = await OfferedService.getAllOffered(
    req.query
  );

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Offered fetched succesfully',
    data: result
  });
});

export const OfferedController = {
  createOffered,
  getAllOffered,
  getActiveOfferedService
}