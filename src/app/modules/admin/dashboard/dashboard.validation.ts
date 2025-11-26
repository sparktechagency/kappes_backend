import { z } from 'zod';

export const updateVendorSchema = z.object({
    body: z.object({
        name: z.string().optional(),
        ownerName: z.string().optional(), // Assuming owner name update might involve user update, but for now just shop fields
        phone: z.string().optional(),
        address: z.object({
            province: z.string().optional(),
            city: z.string().optional(),
            territory: z.string().optional(),
            detail_address: z.string().optional(),
        }).optional(),
        isActive: z.boolean().optional(),
    }),
});

export const createProductSchema = z.object({
    body: z.object({
        name: z.string({ required_error: 'Product name is required' }),
        description: z.string({ required_error: 'Description is required' }),
        basePrice: z.number({ required_error: 'Price is required' }).min(0),
        totalStock: z.number({ required_error: 'Stock is required' }).min(0),
        categoryId: z.string({ required_error: 'Category is required' }),
        subcategoryId: z.string({ required_error: 'Subcategory is required' }),
        brandId: z.string({ required_error: 'Brand is required' }),
        shopId: z.string({ required_error: 'Shop ID is required' }),
        images: z.array(z.string()).min(1, 'At least one image is required'),
        tags: z.array(z.string()).optional(),
        weight: z.number().optional(),
        product_variant_Details: z.array(z.object({
            variantId: z.string(),
            variantQuantity: z.number(),
            variantPrice: z.number(),
        })).optional(),
    }),
});

export const updateProductSchema = z.object({
    body: z.object({
        name: z.string().optional(),
        description: z.string().optional(),
        basePrice: z.number().min(0).optional(),
        totalStock: z.number().min(0).optional(),
        categoryId: z.string().optional(),
        subcategoryId: z.string().optional(),
        brandId: z.string().optional(),
        images: z.array(z.string()).optional(),
        tags: z.array(z.string()).optional(),
        weight: z.number().optional(),
        product_variant_Details: z.array(z.object({
            variantId: z.string(),
            variantQuantity: z.number(),
            variantPrice: z.number(),
        })).optional(),
    }),
});
