import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import { ReviewService } from './review.service';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';
import { IJwtPayload } from '../auth/auth.interface';

const createProductReview = catchAsync(async (req: Request, res: Response) => {
     const result = await ReviewService.createProductReviewToDB(req.body, req.user as IJwtPayload);

     sendResponse(res, {
          statusCode: StatusCodes.OK,
          success: true,
          message: 'Review Created Successfully',
          data: result,
     });
});

const getProductReviews = catchAsync(async (req: Request, res: Response) => {
     const result = await ReviewService.getProductReviews(req.params.productId,req.query);

     sendResponse(res, {
          statusCode: StatusCodes.OK,
          success: true,
          message: 'Product Reviews Retrieved Successfully',
          data: result,
     });
});

const deleteProductReview = catchAsync(async (req: Request, res: Response) => {
     const result = await ReviewService.deleteProductReview(req.params.reviewId,req.user as IJwtPayload);

     sendResponse(res, {
          statusCode: StatusCodes.OK,
          success: true,
          message: 'Product Review Deleted Successfully',
          data: result,
     });
});

const getAllProductReviewsByVendorAndShopAdmin = catchAsync(async (req: Request, res: Response) => {
     const result = await ReviewService.getAllProductReviewsByVendorAndShopAdmin(req.query);

     sendResponse(res, {
          statusCode: StatusCodes.OK,
          success: true,
          message: 'Product Reviews Retrieved Successfully',
          data: result,
     });
});

const getShopProductsReviews = catchAsync(async (req: Request, res: Response) => {
     const result = await ReviewService.getShopProductsReviews(req.params.shopId,req.query,req.user as IJwtPayload );

     sendResponse(res, {
          statusCode: StatusCodes.OK,
          success: true,
          message: 'Product Reviews Retrieved Successfully',
          data: result,
     });
});

export const ReviewController = { createProductReview,getProductReviews,deleteProductReview,getAllProductReviewsByVendorAndShopAdmin,getShopProductsReviews };
