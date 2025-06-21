import { Request, Response } from "express";
import { VariantService } from "./variant.service";
import { createVariantSchema } from "./variant.validation";
import sendResponse from "../../../shared/sendResponse";
import { StatusCodes } from "http-status-codes";
import catchAsync from "../../../shared/catchAsync";
import { IJwtPayload } from "../auth/auth.interface";



const createVariantController = catchAsync(async (req, res) => {
    const variantData = req.body;
    const result = await VariantService.createVariant(variantData,req.user as IJwtPayload);
    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Variant created successfully',
        data: result,
    });
});

const getAllVariants = catchAsync(async (req, res) => {
    const result = await VariantService.getAllVariantsFromDB(req.query);
    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Variant retrived successfully',
        data: result,
    });
});

const getSingleVariantById = catchAsync(async (req, res) => {
    const result = await VariantService.getSingleVariantByIdFromDB(req.params.id);
    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Variant retrived successfully',
        data: result,
    });
});

const getSingleVariantBySlug = catchAsync(async (req, res) => {
    const { slug } = req.params;
    const result = await VariantService.getSingleVariantBySlugFromDB(slug);
    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Variant retrived successfully',
        data: result,
    });
});

const updateVariantController = catchAsync(async (req, res) => {
    const result = await VariantService.updateVariant(req.params.id, req.body,req.user as IJwtPayload);
    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Variant updated successfully',
        data: result,
    });
});


const deleteVariantController = catchAsync(async (req, res) => {
    const id = req.params.id;
    const result = await VariantService.deleteVariant(id,req.user as IJwtPayload);

    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Variant delete successfully',
        data: result,
    });
});

const getVariantsBySubCategoryId = catchAsync(async (req, res) => {
    const result = await VariantService.getVariantsBySubCategoryIdFromDB(req.params.id,req.query);
    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Variant retrived successfully',
        data: result,
    });
});

const getVariantFieldsBySubCategoryId = catchAsync(async (req, res) => {
    const result = await VariantService.getVariantFieldsBySubCategoryIdFromDB(req.params.id, req.query);
    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Variant fields retrieved successfully',
        data: result,
    });
});

export const variantController = {
    createVariantController,
    getAllVariants,
    getSingleVariantById,
    getSingleVariantBySlug,
    updateVariantController,
    deleteVariantController,
    getVariantsBySubCategoryId,
    getVariantFieldsBySubCategoryId,
}