import { z } from 'zod';
import { COUPON_DISCOUNT_TYPE } from './coupon.enums';
import { objectIdSchema } from '../user/user.validation';

export const createCouponSchema = z.object({
    create: z.object({
        code: z.string(),
        shopId: objectIdSchema,
        discountType: z.enum([...Object.values(COUPON_DISCOUNT_TYPE)] as [string, ...string[]]),
        discountValue: z.number(),
        maxDiscountAmount: z.number().optional(),
        startDate: z.date(),
        endDate: z.date(),
        minOrderAmount: z.number().optional(),
        isActive: z.boolean(),
        isDeleted: z.boolean(),
        // aboves are of next hero ⬆️⬆️
        createdBy: z.string(),
        name: z.string(),
        description: z.string().optional(),
    })
});

export const updateCouponSchema = z.object({
    body: z.object({
        code: z.string().optional(),
        shopId: objectIdSchema.optional(),
        discountType: z.enum([...Object.values(COUPON_DISCOUNT_TYPE)] as [string, ...string[]]).optional(),
        discountValue: z.number().optional(),
        maxDiscountAmount: z.number().optional(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
        minOrderAmount: z.number().optional(),
        isActive: z.boolean().optional(),
        isDeleted: z.boolean().optional(),
        // aboves are of next hero ⬆️⬆️
        createdBy: z.string().optional(),
        name: z.string().optional(),
        description: z.string().optional(),
    })
});
const getCouponByCodeValidationSchema = z.object({
    body: z.object({
        orderAmount: z.number(),
        shopId: objectIdSchema,
    })
})

export const createCouponValidation = {
    createCouponValidationSchema: createCouponSchema,
    updateCouponValidationSchema: updateCouponSchema,
    getCouponByCodeValidationSchema: getCouponByCodeValidationSchema,
}
