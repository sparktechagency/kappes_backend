import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { 
    getCart as getCartService,
    addToCart as addToCartService,
    updateCartItem as updateCartItemService,
    removeFromCart as removeFromCartService,
    clearCart as clearCartService
} from './cart.service';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import AppError from '../../../errors/AppError';
import { IJwtPayload } from '../auth/auth.interface';

export const getCart = catchAsync(async (req: Request, res: Response) => {
    const user = req.user as IJwtPayload;
    const cart = await getCartService(user.id);
    
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: 'Cart retrieved successfully',
        data: cart
    });
});

export const addToCart = catchAsync(async (req: Request, res: Response) => {
    const user = req.user as IJwtPayload;

    const result = await addToCartService(user.id, req.body.items);
    
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: 'Items added to cart successfully',
        data: result
    });
});

export const updateCartItem = catchAsync(async (req: Request, res: Response) => {
    const user = req.user as IJwtPayload;
    const { itemId } = req.params;
    const { variantQuantity } = req.body;

    if (!user) {
        throw new AppError(StatusCodes.UNAUTHORIZED, 'User not authenticated');
    }

    if (!variantQuantity || variantQuantity < 1) {
        throw new AppError(StatusCodes.BAD_REQUEST, 'Quantity must be at least 1');
    }

    const cart = await updateCartItemService(user.id, itemId, { variantQuantity });
    
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: 'Cart item updated successfully',
        data: {
            cart
        }
    });
});

export const removeFromCart = catchAsync(async (req: Request, res: Response) => {
    const user = req.user as IJwtPayload;
    const { itemId } = req.params;

    if (!user) {
        throw new AppError(StatusCodes.UNAUTHORIZED, 'User not authenticated');
    }

    const cart = await removeFromCartService(user.id, itemId);
    
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: 'Item removed from cart successfully',
        data: {
            cart
        }
    });
});

export const clearCart = catchAsync(async (req: Request, res: Response) => {
    const user = req.user as IJwtPayload;
    if (!user) {
        throw new AppError(StatusCodes.UNAUTHORIZED, 'User not authenticated');
    }

    const cart = await clearCartService(user.id);
    
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: 'Cart cleared successfully',
        data: {
            cart
        }
    });
});