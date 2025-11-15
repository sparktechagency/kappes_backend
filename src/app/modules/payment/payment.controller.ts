import { Request, Response } from 'express';
import { paymentService } from './payment.service';
import { StatusCodes } from 'http-status-codes';
import { IJwtPayload } from '../auth/auth.interface';
import sendResponse from '../../../shared/sendResponse';
import catchAsync from '../../../shared/catchAsync';

// Create Field
const createPayment = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.user as IJwtPayload;

  req.body.customerId = id;

  const result = await paymentService.createPaymentService(req.body);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Payment successfully',
    data: result,
  });
});

const getPaymentByCustomer = catchAsync(async (req: Request, res: Response) => {
  const { id, role }: any = req.user;

  const { result } = await paymentService.getAllPaymentByUserId(
    id,
    role,
    req.query,
  );

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    data: result,
    message: ' All payment get successful!!',
  });
});
const getAllPaymentByOwnerId = catchAsync(async (req: Request, res: Response) => {
  const { userId }: any = req.user;
  // console.log({ userId });
  const result = await paymentService.getAllPaymentByOwnerIdService(userId);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    data: result,
    message: ' All payment get successful!!',
  });
});

const getLast12MonthsEarnings = catchAsync(async (req: Request, res: Response) => {
  const { userId, role }: any = req.user;
  // console.log({ userId });
  const result = await paymentService.getLast12MonthsEarningsService(
    userId,
    role,
  );

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    data: result,
    message: 'Last 12MonthsEarnings get successful!!',
  });
});

const successPage = catchAsync(async (req: Request, res: Response) => {
  console.log('hit hoise ✅');
  res.render('success.ejs');
});

const cancelPage = catchAsync(async (req: Request, res: Response) => {
  res.render('cancel.ejs');
});

const getAllPaymentByAdmin = catchAsync(async (req: Request, res: Response) => {
  const result = await paymentService.getAllPaymentByAdminService(req.query);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    data: result,
    message: ' All payment get successful!!',
  });
});

const getPaymentDetailByAdminById = catchAsync(async (req: Request, res: Response) => {
  const result = await paymentService.getPaymentDetailByAdminByIdService(req.params.id);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    data: result,
    message: 'Payment detail get successful!!',
  });
});

const deletePaymentDetailByAdminById = catchAsync(async (req: Request, res: Response) => {
  const result = await paymentService.deletePaymentDetailByAdminByIdService(req.params.id);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    data: result,
    message: 'Payment detail delete successful!!',
  });
});

export const paymenController = {
  createPayment,
  getPaymentByCustomer,
  getAllPaymentByOwnerId,
  getLast12MonthsEarnings,
  successPage,
  cancelPage,
  getAllPaymentByAdmin,
  getPaymentDetailByAdminById,
  deletePaymentDetailByAdminById,
};
