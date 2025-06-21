// ShopController.ts
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { ShopService } from './shop.service';

const createShop = catchAsync(async (req: Request, res: Response) => {
    const result = await ShopService.createShop(req.body);
    sendResponse(res, {
        statusCode: StatusCodes.CREATED,
        success: true,
        message: 'Shop created successfully',
        data: result,
    });
});

const getAllShops = catchAsync(async (req: Request, res: Response) => {
    const result = await ShopService.getAllShops(req.query);
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: 'Shops retrieved successfully',
        data: result,
    });
});

const getShopById = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await ShopService.getShopById(id);
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: 'Shop retrieved successfully',
        data: result,
    });
});

const updateShopById = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await ShopService.updateShopById(id, req.body);
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: 'Shop updated successfully',
        data: result,
    });
});

const deleteShopById = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    await ShopService.deleteShopById(id);
    sendResponse(res, {
        statusCode: StatusCodes.NO_CONTENT,
        success: true,
        message: 'Shop deleted successfully',
    });
});

const getShopsByOwner = catchAsync(async (req: Request, res: Response) => {
    const { ownerId } = req.params;
    const result = await ShopService.getShopsByOwner(ownerId);
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: 'Shops by owner retrieved successfully',
        data: result,
    });
});
const getShopsByLocation = catchAsync(async (req: Request, res: Response) => {
    const result = await ShopService.getShopsByLocation(req.query);
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: 'Shops by location retrieved successfully',
        data: result,
    });
});

const getShopsByType = catchAsync(async (req: Request, res: Response) => {
    const { type } = req.params;
    const result = await ShopService.getShopsByType(type);
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: 'Shops by type retrieved successfully',
        data: result,
    });
});

const getChatsByShop = catchAsync(async (req: Request, res: Response) => {
    const { shopId } = req.params;
    const result = await ShopService.getChatsByShop(shopId);
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: 'Chats by shop retrieved successfully',
        data: result,
    });
});

const getOrdersByShop = catchAsync(async (req: Request, res: Response) => {
    const { shopId } = req.params;
    const result = await ShopService.getOrdersByShop(shopId);
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: 'Orders by shop retrieved successfully',
        data: result,
    });
});

const getCouponsByShop = catchAsync(async (req: Request, res: Response) => {
    const { shopId } = req.params;
    const result = await ShopService.getCouponsByShop(shopId);
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: 'Coupons by shop retrieved successfully',
        data: result,
    });
});

const getAdminsByShop = catchAsync(async (req: Request, res: Response) => {
    const { shopId } = req.params;
    const result = await ShopService.getAdminsByShop(shopId);
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: 'Admins by shop retrieved successfully',
        data: result,
    });
});

const getFollowersByShop = catchAsync(async (req: Request, res: Response) => {
    const { shopId } = req.params;
    const result = await ShopService.getFollowersByShop(shopId);
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: 'Followers by shop retrieved successfully',
        data: result,
    });
});

const addAdminToShop = catchAsync(async (req: Request, res: Response) => {
    const { shopId } = req.params;
    const { adminId } = req.body;
    const result = await ShopService.addAdminToShop(shopId, adminId);
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: 'Admin added to shop successfully',
        data: result,
    });
});

const removeAdminFromShop = catchAsync(async (req: Request, res: Response) => {
    const { shopId, adminId } = req.params;
    const result = await ShopService.removeAdminFromShop(shopId, adminId);
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: 'Admin removed from shop successfully',
        data: result,
    });
});

const toggleFollowUnfollowShop = catchAsync(async (req: Request, res: Response) => {
    const { shopId } = req.params;
    const { userId } = req.body;
    const result = await ShopService.toggleFollowUnfollowShop(shopId, userId);
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: 'Shop successfully followed/unfollowed',
        data: result,
    });
});

const getShopByEmail = catchAsync(async (req: Request, res: Response) => {
    const { email } = req.query;
    const result = await ShopService.getShopByEmail(email as string);
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: 'Shop retrieved successfully',
        data: result,
    });
});

const getShopByName = catchAsync(async (req: Request, res: Response) => {
    const { name } = req.query;
    const result = await ShopService.getShopByName(name as string);
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: 'Shop retrieved successfully',
        data: result,
    });
});

const getShopByOwnerId = catchAsync(async (req: Request, res: Response) => {
    const { ownerId } = req.params;
    const result = await ShopService.getShopByOwnerId(ownerId);
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: 'Shop by owner ID retrieved successfully',
        data: result,
    });
});

// getShopsByShopCategory
const getShopsByShopCategory = catchAsync(async (req: Request, res: Response) => {
    const { category } = req.params;
    const result = await ShopService.getShopsByShopCategory(category);
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: 'Shops by category retrieved successfully',
        data: result,
    });
});



export const ShopController = {
    createShop,
    getAllShops,
    getShopById,
    updateShopById,
    deleteShopById,
    getShopsByOwner,
    getShopsByLocation,
    getShopsByType,
    getChatsByShop,
    getOrdersByShop,
    getCouponsByShop,
    getAdminsByShop,
    getFollowersByShop,
    addAdminToShop,
    removeAdminFromShop,
    getShopByEmail,
    getShopByName,
    getShopByOwnerId,
    getShopsByShopCategory, toggleFollowUnfollowShop,
}

