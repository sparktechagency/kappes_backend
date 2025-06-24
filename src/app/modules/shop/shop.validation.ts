import { z } from "zod"
import { objectIdSchema } from "../variant/variant.validation"
import { BUSINESS_TYPES } from "../business/business.enums"

const createShopZodSchema = z.object({
    body: z.object({
        name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name must not exceed 100 characters'),
        email: z.string().email('Invalid email address'),
        phone: z.string(),
        categories: objectIdSchema.array(),
        // ..
        type: z.nativeEnum(BUSINESS_TYPES).optional(),
        description: z.string().optional(),
        address: z.object({
            province: z.string(),
            territory: z.string(),
            city: z.string(),
            country: z.string(),
            detail_address: z.string(),
        }).optional(),
        location: z.object({
            type: z.string(),
            coordinates: z.array(z.number()),
        }).optional(),
        service: z.string().optional(),
        working_hours: z.array(z.object({
            day: z.string(),
            start: z.string(),
            end: z.string(),
        })).optional(),
        website: z.string().optional(),
        revenue: z.number().optional(),
    })
})  

const updateShopZodSchema = z.object({
    body: z.object({
        name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name must not exceed 100 characters').optional(),
        email: z.string().email('Invalid email address').optional(),
        phone: z.string().optional(),
        categories: objectIdSchema.array().optional(),
        owner: objectIdSchema.optional(),
        // ..
        type: z.nativeEnum(BUSINESS_TYPES).optional(),
        description: z.string().optional(),
        address: z.object({
            province: z.string(),
            territory: z.string(),
            city: z.string(),
            country: z.string(),
            detail_address: z.string(),
        }).optional(),
        location: z.object({
            type: z.string(),
            coordinates: z.array(z.number()),
        }).optional(),
        service: z.string().optional(),
        working_hours: z.array(z.object({
            day: z.string(),
            start: z.string(),
            end: z.string(),
        })).optional(),
        website: z.string().optional(),
        revenue: z.number().optional(),
            settings: z.object({
            allowChat: z.boolean().optional(),
            autoAcceptOrders: z.boolean().optional(),
        }).optional(),  
    })
})  

const makeShopAdminZodSchema = z.object({
    body: z.object({
        userId: objectIdSchema,
    })
})



export const ShopValidation = {
    createShopZodSchema,
    updateShopZodSchema,
    makeShopAdminZodSchema
}