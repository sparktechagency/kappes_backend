import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { IJwtPayload } from '../auth/auth.interface';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { ShippingService } from './shipping.services';

const getListOrders = catchAsync(async (req: Request, res: Response) => {
    const result = await ShippingService.getListOrders(req.query);
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: 'Orders retrieved successfully',
        data: result
    });
});

const createOrder = catchAsync(async (req: Request, res: Response) => {
    const result = await ShippingService.createOrder(req.body, req.user as IJwtPayload);
    sendResponse(res, {
        statusCode: StatusCodes.CREATED,
        success: true,
        message: 'Order created successfully',
        data: result
    });
});

const createLabelForOrder = catchAsync(async (req: Request, res: Response) => {
    const result = await ShippingService.createLabelForOrder(req.body, req.user as IJwtPayload);
    sendResponse(res, {
        statusCode: StatusCodes.CREATED,
        success: true,
        message: 'Order label created successfully',
        data: result
    });
});


const getCarriers = catchAsync(async (req: Request, res: Response) => {
    const result = await ShippingService.getCarriers(req.query);
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: 'Carriers data retrieved successfully',
        data: result
    });
});

const getListServices = catchAsync(async (req: Request, res: Response) => {
    const result = await ShippingService.getListServices(req.query);
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: 'Services data retrieved successfully',
        data: result
    });
});

//=================== final Methods ==================//
const getShipStationOrderCost = catchAsync(async (req: Request, res: Response) => {
    const result = await ShippingService.getShipStationOrderCost(req.body, req.user as IJwtPayload);
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: 'ShipStation Order Cost retrieved successfully',
        data: result
    });
});
const getChitChatsShippingCost = catchAsync(async (req: Request, res: Response) => {
    const result = await ShippingService.getChitChatsShippingCost(req.body, req.user as IJwtPayload);
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: 'Chit Chats Shipping Cost retrieved successfully',
        data: result
    });
});

export const ShippingController = {
    getListOrders,
    createOrder,
    createLabelForOrder,
    getCarriers,
    getListServices,

    getShipStationOrderCost,
    getChitChatsShippingCost
};