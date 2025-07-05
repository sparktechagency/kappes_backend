import { Request, Response } from "express";
import { OrderService } from "./order.service";
import { StatusCodes } from "http-status-codes";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { IJwtPayload } from "../auth/auth.interface";

const createOrder = catchAsync(async (req: Request, res: Response) => {
  const result = await OrderService.createOrder(
    req.body,
    req.user as IJwtPayload
  );

  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: "Order created succesfully",
    data: result,
  });
});

const getMyShopOrders = catchAsync(async (req: Request, res: Response) => {
  const result = await OrderService.getMyShopOrders(
    req.query,
    req.user as IJwtPayload
  );

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Order retrive succesfully",
    data: result
  });
});

const getOrderDetails = catchAsync(async (req: Request, res: Response) => {
  const result = await OrderService.getOrderDetails(req.params.orderId, req.user as IJwtPayload);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Order retrive succesfully",
    data: result,
  });
});

const getMyOrders = catchAsync(async (req: Request, res: Response) => {
  const result = await OrderService.getMyOrders(
    req.query,
    req.user as IJwtPayload
  );

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Order retrive succesfully",
    data: result,
  });
});

const changeOrderStatus = catchAsync(async (req: Request, res: Response) => {
  const { status } = req.body;
  const result = await OrderService.changeOrderStatus(
    req.params.orderId,
    status,
    req.user as IJwtPayload
  );

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Order status changed succesfully",
    data: result,
  });
});

const cancelOrder = catchAsync(async (req: Request, res: Response) => {
  const result = await OrderService.cancelOrder(
    req.params.id,
    req.user as IJwtPayload
  );

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Order cancelled succesfully",
    data: result,
  });
});

const getOrdersByShopId = catchAsync(async (req: Request, res: Response) => {
  const result = await OrderService.getOrdersByShopId(
    req.params.shopId,
    req.user as IJwtPayload,
    req.query
  );

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Order retrive succesfully",
    data: result,
  });
});

const getAllRefundOrderRequests = catchAsync(async (req: Request, res: Response) => {
  const shopId = req.params.shopId;
  const result = await OrderService.getAllRefundOrderRequests(
    req.query,
    req.user as IJwtPayload,
    shopId
  );

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "isNeedRefund Orders retrive succesfully",
    data: result,
  });
});

export const OrderController = {
  createOrder,
  getMyShopOrders,
  getOrderDetails,
  getMyOrders,
  changeOrderStatus,
  cancelOrder,
  getOrdersByShopId,
  getAllRefundOrderRequests
};
