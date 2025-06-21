import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import { ShopCategoryService } from './shopCategory.service';
import sendResponse from '../../../shared/sendResponse';
import { IJwtPayload } from '../auth/auth.interface';


const createShopCategory = catchAsync(async (req, res) => {
     const categoryData = req.body;
     const result = await ShopCategoryService.createShopCategoryToDB(categoryData,req.user as IJwtPayload);
     sendResponse(res, {
          success: true,
          statusCode: StatusCodes.OK,
          message: 'Shop category created successfully',
          data: result,
     });
});

const getAllShopCategory = catchAsync(async (req, res) => {
   const result = await ShopCategoryService.getAllShopCategory(req.query);

   sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: 'Shop categories are retrieved successfully',
      data: result,
   });
});

const updateShopCategory = catchAsync(async (req, res) => {
   const { id } = req.params;
   const result = await ShopCategoryService.updateShopCategoryIntoDB(
      id,
      req.body,
      req.user as IJwtPayload
   );

   sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: 'Shop category is updated successfully',
      data: result,
   });
});

const deleteShopCategory = catchAsync(async (req, res) => {
   const { id } = req.params;
   const result = await ShopCategoryService.deleteShopCategoryIntoDB(
      id,
      req.user as IJwtPayload
   );

   sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: 'Brand is deleted successfully',
      data: result,
   });
});

export const ShopCategoryController = {
   createShopCategory,
   getAllShopCategory,
   updateShopCategory,
   deleteShopCategory
};
