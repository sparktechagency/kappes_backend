
import { StatusCodes } from "http-status-codes";
import { Request, Response } from "express";
import catchAsync from "../../../../shared/catchAsync";
import sendResponse from "../../../../shared/sendResponse";
import { IJwtPayload } from "../../auth/auth.interface";
import { DashboardService } from "./dashboard.service";
export const getOverview = catchAsync(async (req: Request, res: Response) => {
    const user = req.user as IJwtPayload;

    const result = await DashboardService.getOverview(user);

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: 'Overview retrieved successfully',
        data: result,
    });
});

export const DashboardController = {
    getOverview,
};
