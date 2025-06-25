import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { ProductService } from './product.service';
import { IJwtPayload } from '../auth/auth.interface';
import { USER_ROLES } from '../user/user.enums';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';

const createProduct = catchAsync(async (req: Request, res: Response) => {
    const result = await ProductService.createProduct(req.body, req.user as IJwtPayload);
    sendResponse(res, {
        statusCode: StatusCodes.CREATED,
        success: true,
        message: 'Product created successfully',
        data: result
    });
});

const getProducts = catchAsync(async (req: Request, res: Response) => {
    const result = await ProductService.getProducts(req.query);
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: 'Products retrieved successfully',
        data: result
    });
});

const getProductById = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await ProductService.getProductById(id);
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: 'Product retrieved successfully',
        data: result
    });
});

const updateProduct = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await ProductService.updateProduct(id, req.body, req.user as IJwtPayload);
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: 'Product updated successfully',
        data: result
    });
});

const deleteProduct = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await ProductService.deleteProduct(id, req.user as IJwtPayload);
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: 'Product deleted successfully',
        data: result
    });
});

const getProductsByCategory = catchAsync(async (req: Request, res: Response) => {
    const { categoryId } = req.params;
    const result = await ProductService.getProductsByCategory(categoryId as string,req.query);
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: 'Products retrieved successfully',
        data: result
    });
});

const updateToggleProductIsRecommended = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await ProductService.updateToggleProductIsRecommended(id, req.user as IJwtPayload);
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: 'Product updated successfully',
        data: result
    });
});

const getRecommendedProducts = catchAsync(async (req: Request, res: Response) => {
    const result = await ProductService.getRecommendedProducts(req.query);
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: 'Products retrieved successfully',
        data: result
    });
});

const getProductsByShop = catchAsync(async (req: Request, res: Response) => {
    const { shopId } = req.params;
    const result = await ProductService.getProductsByShop(shopId as string,req.query);
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: 'Products retrieved successfully',
        data: result
    });
});

export const ProductController = {
    createProduct,
    getProducts,
    getProductById,
    updateProduct,
    deleteProduct,
    getProductsByCategory,
    updateToggleProductIsRecommended,
    getRecommendedProducts,
    getProductsByShop
}
