// src/app/modules/cart/cart.validation.ts
import { z } from 'zod';
import { objectIdSchema } from '../user/user.validation';

const cartItemSchema = z.object({
    productId: objectIdSchema,
    variantId: objectIdSchema,
    variantQuantity: z.number().int().min(1, 'Quantity must be at least 1'),
});

export const createCartValidation = z.object({
    body: z.object({
        items: z.array(cartItemSchema).min(1, 'At least one item is required')
    })
});

export const updateCartValidation = z.object({
    body: z.object({
        items: z.array(cartItemSchema).min(1, 'At least one item is required')
    })
});


export const CartValidationSchema = {
    createCartValidation,
    updateCartValidation
}