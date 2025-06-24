import { z } from 'zod';
import { IProductSingleVariant, IProductSingleVariantByFieldName } from './product.interface';
import { objectIdSchema } from '../user/user.validation';
import { GRAPHICS_CARD_TYPE, NETWOR_TYPE, OS_TYPE, PROCESSOR_TYPE, RAM_OR_STORAGE_OR_GRAPHICS_CARD, RESOLUTION_TYPE, STORAGE_TYPE, VARIANT_OPTIONS } from '../variant/variant.enums';

const productVariantSchema = z.object({
    variantId: objectIdSchema,
    variantQuantity: z.number().min(0, 'Variant quantity must be non-negative'),
    variantPrice: z.number().min(0, 'Variant price must be non-negative')
});

const productVariantByFieldNameSchema = z.object({
    color: z.object({
        name: z.string().optional(),
        code: z.string().optional(),
    }).optional(),
    storage: z.union([z.enum(Object.values(RAM_OR_STORAGE_OR_GRAPHICS_CARD) as [string, ...string[]]), z.string()]).optional(),
    ram: z.union([z.enum(Object.values(RAM_OR_STORAGE_OR_GRAPHICS_CARD) as [string, ...string[]]), z.string()]).optional(),
    network_type: z.array(z.union([z.enum(Object.values(NETWOR_TYPE) as [string, ...string[]]), z.string()])).optional(),
    operating_system: z.union([z.enum(Object.values(OS_TYPE) as [string, ...string[]]), z.string()]).optional(),
    storage_type: z.union([z.enum(Object.values(STORAGE_TYPE) as [string, ...string[]]), z.string()]).optional(),
    processor_type: z.union([z.enum(Object.values(PROCESSOR_TYPE) as [string, ...string[]]), z.string()]).optional(),
    processor: z.string().optional(),
    graphics_card_type: z.union([z.enum(Object.values(GRAPHICS_CARD_TYPE) as [string, ...string[]]), z.string()]).optional(),
    graphics_card_size: z.union([z.enum(Object.values(RAM_OR_STORAGE_OR_GRAPHICS_CARD) as [string, ...string[]]), z.string()]).optional(),
    screen_size: z.number().positive().optional(),
    resolution: z.union([z.enum(Object.values(RESOLUTION_TYPE) as [string, ...string[]]), z.string()]).optional(),
    lens_kit: z.string().optional(),
    material: z.string().optional(),
    size: z.string().optional(),
    fabric: z.string().optional(),
    weight: z.number().positive().optional(),
    dimensions: z.string().optional(),
    capacity: z.string().optional(),
    options: z.enum(Object.values(VARIANT_OPTIONS) as [string, ...string[]]).optional(),
    variantQuantity: z.number().min(0, 'Variant quantity must be non-negative'),
    variantPrice: z.number().min(0, 'Variant price must be non-negative')
});

const createProductZodSchema = z.object({
    body: z.object({
        name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name must not exceed 100 characters'),
        description: z.string().min(10, 'Description must be at least 10 characters'),
        basePrice: z.number().min(0, 'Price must be non-negative'),
        images: z.array(z.string()).min(1, 'At least one image is required'),
        tags: z.array(z.string()).min(1, 'At least one tag is required'),
        categoryId: objectIdSchema,
        subcategoryId: objectIdSchema,
        shopId: objectIdSchema,
        brandId: objectIdSchema,
        product_variant_Details: z.array(
            z.union([
                productVariantSchema,
                productVariantByFieldNameSchema
            ])
        ).min(1, 'At least one variant is required'),
        weight: z.number().optional(),
    })
});

const updateProductZodSchema = createProductZodSchema.deepPartial();

const getProductsByCategoryZodSchema = z.object({
    query: z.object({
        categoryId: objectIdSchema,
        page: z.number().optional(),
        limit: z.number().optional()
    })
});

const getProductByIdZodSchema = z.object({
    params: z.object({
        id: objectIdSchema
    })
});

const deleteProductZodSchema = getProductByIdZodSchema;

export const ProductValidation = {
    createProductZodSchema,
    updateProductZodSchema,
    getProductsByCategoryZodSchema,
    getProductByIdZodSchema,
    deleteProductZodSchema,
};
