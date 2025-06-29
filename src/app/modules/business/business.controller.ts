import { StatusCodes } from "http-status-codes";
import sendResponse from "../../../shared/sendResponse";
import catchAsync from "../../../shared/catchAsync";
import { BusinessService } from "./business.service";
import { Request, Response } from "express";
import { IJwtPayload } from "../auth/auth.interface";

const createBusiness = catchAsync(async (req: Request, res: Response) => {
    const result = await BusinessService.createBusiness(req.body, req.user as IJwtPayload);
    sendResponse(res, {
        statusCode: StatusCodes.CREATED,
        success: true,
        message: 'Business created successfully',
        data: result,
    });
});


// resend Otp
const resendOtp = catchAsync(async (req, res) => {
     const { email } = req.body;
     await BusinessService.resendOtpFromDb(email);

     sendResponse(res, {
          success: true,
          statusCode: StatusCodes.OK,
          message: 'OTP sent successfully again',
     });
});


const verifyEmail = catchAsync(async (req, res) => {
     const { ...verifyData } = req.body;
     const result = await BusinessService.verifyEmailToDB(verifyData);

     sendResponse(res, {
          success: true,
          statusCode: StatusCodes.OK,
          message: result.message,
          data: {
               verifyToken: result.verifyToken,
               accessToken: result.accessToken,
          },
     });
});


const getAllVerifiedBusinesses = catchAsync(async (req, res) => {
     const result = await BusinessService.getAllVerifiedBusinesses(req.query);
     sendResponse(res, {
          success: true,
          statusCode: StatusCodes.OK,
          message: 'Businesses fetched successfully',
          data: result,
     });
});     


const getAllMessagesOfBusiness = catchAsync(async (req, res) => {
     const { id } = req.params;
     const result = await BusinessService.getAllMessagesOfBusiness(id, req.user as IJwtPayload, req.query);
     sendResponse(res, {
          success: true,
          statusCode: StatusCodes.OK,
          message: 'Messages fetched successfully',
          data: result,
     });
}); 

const sendMessageToBusiness = catchAsync(async (req, res) => {
     const { id } = req.params;
     const result = await BusinessService.sendMessageToBusiness(id, req.body);
     sendResponse(res, {
          success: true,
          statusCode: StatusCodes.OK,
          message: 'Message sent successfully',
          data: result,
     });
}); 


const getBusinessDetails = catchAsync(async (req, res) => {
     const { id } = req.params;
     const result = await BusinessService.getBusinessDetails(id);
     sendResponse(res, {
          success: true,
          statusCode: StatusCodes.OK,
          message: 'Business details fetched successfully',
          data: result,
     });
});

const deleteBusiness = catchAsync(async (req, res) => {
     const { id } = req.params;
     const result = await BusinessService.deleteBusiness(id, req.user as IJwtPayload);
     sendResponse(res, {
          success: true,
          statusCode: StatusCodes.OK,
          message: 'Business deleted successfully',
          data: result,
     });
});

const getAllBusinessesOfUser = catchAsync(async (req, res) => {
     const result = await BusinessService.getAllBusinessesOfUser(req.user as IJwtPayload, req.query);
     sendResponse(res, {
          success: true,
          statusCode: StatusCodes.OK,
          message: 'Businesses fetched successfully',
          data: result,
     });
});

const updateBusiness = catchAsync(async (req, res) => {
     const { id } = req.params;
     const result = await BusinessService.updateBusiness(id, req.body, req.user as IJwtPayload);
     sendResponse(res, {
          success: true,
          statusCode: StatusCodes.OK,
          message: 'Business updated successfully',
          data: result,
     });
});


export const BusinessController = {
    createBusiness,
    resendOtp,
    verifyEmail,
    getAllVerifiedBusinesses,
    getAllMessagesOfBusiness,
    sendMessageToBusiness,
    getBusinessDetails,
    deleteBusiness,
    getAllBusinessesOfUser,
    updateBusiness
}