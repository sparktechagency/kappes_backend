import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { CategoryService } from './subCategory.service';
import { IJwtPayload } from '../auth/auth.interface';

const createSubCategory = catchAsync(async (req, res) => {
     const serviceData = req.body;
     const result = await CategoryService.createSubCategoryToDB(serviceData,req.user as IJwtPayload);
     sendResponse(res, {
          success: true,
          statusCode: StatusCodes.OK,
          message: 'Sub category created successfully',
          data: result,
     });
});
// get sub categorys
const getSubCategories = catchAsync(async (req, res) => {
     const result = await CategoryService.getCategoriesFromDB(req.query);
     sendResponse(res, {
          success: true,
          statusCode: StatusCodes.OK,
          message: 'Sub category retrieved successfully',
          data: result,
     });
});
const getSubcategorisById = catchAsync(async (req, res) => {
     const result = await CategoryService.getSubCategoryDetails(req.params.id);
     sendResponse(res, {
          success: true,
          statusCode: StatusCodes.OK,
          message: 'Sub category retrieved successfully',
          data: result,
     });
});

const updateSubCategory = catchAsync(async (req, res) => {
     const id = req.params.id;
     const updateCategoryData = req.body;

     const result = await CategoryService.updateSubCategoryToDB(id, updateCategoryData,req.user as IJwtPayload);

     sendResponse(res, {
          success: true,
          statusCode: StatusCodes.OK,
          message: 'Sub category updated successfully',
          data: result,
     });
});

const deleteSubCategory = catchAsync(async (req, res) => {
     const id = req.params.id;
     const result = await CategoryService.deleteSubCategoryToDB(id, req.user as IJwtPayload);

     sendResponse(res, {
          success: true,
          statusCode: StatusCodes.OK,
          message: 'Sub category delete successfully',
          data: result,
     });
});
const getSubCategoryReletedToCategory = catchAsync(async (req, res) => {
     const result = await CategoryService.getSubCategoryReletedToCategory(req.params.id);

     sendResponse(res, {
          success: true,
          statusCode: StatusCodes.OK,
          message: 'Sub category retrive successfully',
          data: result,
     });
});

export const CategoryController = {
     createSubCategory,
     getSubCategories,
     updateSubCategory,
     deleteSubCategory,
     getSubCategoryReletedToCategory,
     getSubcategorisById
};
