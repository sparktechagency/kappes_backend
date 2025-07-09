import { Request, Response } from 'express';
import { RequestHandler } from 'express-serve-static-core';
import { VariantFieldService } from './variantField.service';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { IVariantField, ISingleVariantField } from './variantField.interface';
import { StatusCodes } from 'http-status-codes';
import pick from '../../../shared/pick';
import { Types } from 'mongoose';

// List of valid field names
const VALID_FIELDS = [
    'color', 'storage', 'ram', 'network_type', 'operating_system',
    'storage_type', 'processor_type', 'processor', 'graphics_card_type',
    'graphics_card_size', 'screen_size', 'resolution', 'lens_kit',
    'material', 'size', 'fabric', 'weight', 'dimensions', 'capacity', 'options'
];

// Validate field name
const validateFieldName = (fieldName: string): boolean => {
    return VALID_FIELDS.includes(fieldName);
};

// Validate item ID
const validateItemId = (id: string): boolean => {
    return Types.ObjectId.isValid(id);
};

// Get all variant fields
const getVariantField: RequestHandler = catchAsync(
    async (req: Request, res: Response) => {
        const result = await VariantFieldService.getVariantField();

        sendResponse<IVariantField>(res, {
            statusCode: StatusCodes.OK,
            success: true,
            message: 'Variant fields retrieved successfully',
            data: result,
        });
    }
);

// Get specific variant field by name with pagination
const getVariantFieldByName: RequestHandler = catchAsync(
    async (req: Request, res: Response) => {
        const { fieldName } = req.params;

        // Get pagination parameters from query
        const page = Math.max(1, Number(req.query.page) || 1);
        const limit = Math.max(1, Number(req.query.limit) || 10);

        // Validate field name
        const validFields = [
            'color', 'storage', 'ram', 'network_type', 'operating_system',
            'storage_type', 'processor_type', 'processor', 'graphics_card_type',
            'graphics_card_size', 'screen_size', 'resolution', 'lens_kit',
            'material', 'size', 'fabric', 'weight', 'dimensions', 'capacity', 'options'
        ];

        if (!validFields.includes(fieldName)) {
            return sendResponse(res, {
                statusCode: StatusCodes.BAD_REQUEST,
                success: false,
                message: `Invalid field name. Must be one of: ${validFields.join(', ')}`,
            });
        }

        const result = await VariantFieldService.getVariantFieldByName(
            fieldName as keyof IVariantField,
            { page, limit }
        );

        if (!result) {
            return sendResponse(res, {
                statusCode: StatusCodes.NOT_FOUND,
                success: false,
                message: 'Variant field not found',
            });
        }

        sendResponse(res, {
            statusCode: StatusCodes.OK,
            success: true,
            message: 'Variant field retrieved successfully',
            data: result.data,
            pagination: {
                page: result.meta.page,
                limit: result.meta.limit,
                totalPage: result.meta.totalPages,
                total: result.meta.total,
            },
        });
    }
);

// Update variant fields
const updateVariantField: RequestHandler = catchAsync(
    async (req: Request, res: Response) => {
        // Only pick valid fields from the request body
        const validFields = [
            'color', 'storage', 'ram', 'network_type', 'operating_system',
            'storage_type', 'processor_type', 'processor', 'graphics_card_type',
            'graphics_card_size', 'screen_size', 'resolution', 'lens_kit',
            'material', 'size', 'fabric', 'weight', 'dimensions', 'capacity', 'options'
        ];

        const filteredPayload = pick(req.body, validFields);

        if (Object.keys(filteredPayload).length === 0) {
            return sendResponse(res, {
                statusCode: StatusCodes.BAD_REQUEST,
                success: false,
                message: 'No valid fields provided for update',
            });
        }

        const result = await VariantFieldService.updateVariantField(filteredPayload);

        sendResponse<IVariantField>(res, {
            statusCode: StatusCodes.OK,
            success: true,
            message: 'Variant fields updated successfully',
            data: result,
        });
    }
);

// Get paginated items for a specific field
const getFieldItems: RequestHandler = catchAsync(
    async (req: Request, res: Response) => {
        const { fieldName } = req.params;

        if (!validateFieldName(fieldName)) {
            return sendResponse(res, {
                statusCode: StatusCodes.BAD_REQUEST,
                success: false,
                message: `Invalid field name. Must be one of: ${VALID_FIELDS.join(', ')}`,
            });
        }

        const page = Math.max(1, Number(req.query.page) || 1);
        const limit = Math.max(1, Number(req.query.limit) || 10);

        const result = await VariantFieldService.getFieldItems(
            fieldName as keyof IVariantField,
            { page, limit }
        );

        sendResponse(res, {
            statusCode: StatusCodes.OK,
            success: true,
            message: 'Field items retrieved successfully',
            data: result.data,
            pagination: {
                page: result.meta.page,
                limit: result.meta.limit,
                totalPage: result.meta.totalPages,
                total: result.meta.total,
            },
        });
    }
);

// Get a specific field item by ID
const getFieldItemById: RequestHandler = catchAsync(
    async (req: Request, res: Response) => {
        const { fieldName } = req.params;
        const { id } = req.query;

        if (!validateFieldName(fieldName)) {
            return sendResponse(res, {
                statusCode: StatusCodes.BAD_REQUEST,
                success: false,
                message: `Invalid field name. Must be one of: ${VALID_FIELDS.join(', ')}`,
            });
        }

        if (!id || typeof id !== 'string' || !validateItemId(id)) {
            return sendResponse(res, {
                statusCode: StatusCodes.BAD_REQUEST,
                success: false,
                message: 'Valid item ID is required',
            });
        }

        const result = await VariantFieldService.getFieldItemById(
            fieldName as keyof IVariantField,
            id
        );

        if (!result) {
            return sendResponse(res, {
                statusCode: StatusCodes.NOT_FOUND,
                success: false,
                message: 'Field item not found',
            });
        }

        sendResponse(res, {
            statusCode: StatusCodes.OK,
            success: true,
            message: 'Field item retrieved successfully',
            data: result,
        });
    }
);

// Add a new item to a field
const addFieldItem: RequestHandler = catchAsync(
    async (req: Request, res: Response) => {
        const { fieldName } = req.params;
        const itemData = req.body as Omit<ISingleVariantField, '_id'>;

        if (!validateFieldName(fieldName)) {
            return sendResponse(res, {
                statusCode: StatusCodes.BAD_REQUEST,
                success: false,
                message: `Invalid field name. Must be one of: ${VALID_FIELDS.join(', ')}`,
            });
        }

        if (fieldName === 'color' && !itemData.code) {
            return sendResponse(res, {
                statusCode: StatusCodes.BAD_REQUEST,
                success: false,
                message: 'code is required for color variant field',
            });
        }

        const result = await VariantFieldService.addFieldItem(
            fieldName as keyof IVariantField,
            itemData
        );

        sendResponse(res, {
            statusCode: StatusCodes.CREATED,
            success: true,
            message: 'Field item added successfully',
            data: result,
        });
    }
);

// Update a field item
const updateFieldItem: RequestHandler = catchAsync(
    async (req: Request, res: Response) => {
        const { fieldName } = req.params;
        const { id } = req.query;
        const { ...updateData } = req.body;



        if (fieldName === 'color' && !updateData.code) {
            return sendResponse(res, {
                statusCode: StatusCodes.BAD_REQUEST,
                success: false,
                message: 'code is required for color variant field',
            });
        }

        if (!validateFieldName(fieldName)) {
            return sendResponse(res, {
                statusCode: StatusCodes.BAD_REQUEST,
                success: false,
                message: `Invalid field name. Must be one of: ${VALID_FIELDS.join(', ')}`,
            });
        }

        if (!id || !validateItemId(id as string)) {
            return sendResponse(res, {
                statusCode: StatusCodes.BAD_REQUEST,
                success: false,
                message: 'Valid item ID is required',
            });
        }

        const result = await VariantFieldService.updateFieldItem(
            fieldName as keyof IVariantField,
            id as string,
            updateData as Partial<ISingleVariantField>
        );

        if (!result) {
            return sendResponse(res, {
                statusCode: StatusCodes.NOT_FOUND,
                success: false,
                message: 'Field item not found',
            });
        }

        sendResponse(res, {
            statusCode: StatusCodes.OK,
            success: true,
            message: 'Field item updated successfully',
            data: result,
        });
    }
);

// Delete a field item
const deleteFieldItem: RequestHandler = catchAsync(
    async (req: Request, res: Response) => {
        const { fieldName } = req.params;
        const { id } = req.query;

        if (!validateFieldName(fieldName)) {
            return sendResponse(res, {
                statusCode: StatusCodes.BAD_REQUEST,
                success: false,
                message: `Invalid field name. Must be one of: ${VALID_FIELDS.join(', ')}`,
            });
        }

        if (!id || typeof id !== 'string' || !validateItemId(id as string)) {
            return sendResponse(res, {
                statusCode: StatusCodes.BAD_REQUEST,
                success: false,
                message: 'Valid item ID is required',
            });
        }

        const result = await VariantFieldService.deleteFieldItem(
            fieldName as keyof IVariantField,
            id as string
        );

        if (!result) {
            return sendResponse(res, {
                statusCode: StatusCodes.NOT_FOUND,
                success: false,
                message: 'Field item not found',
            });
        }

        sendResponse(res, {
            statusCode: StatusCodes.OK,
            success: true,
            message: 'Field item deleted successfully',
            data: result,
        });
    }
);

export const VariantFieldController = {
    getVariantField,
    getFieldItems,
    getFieldItemById,
    addFieldItem,
    updateFieldItem,
    deleteFieldItem,
};
