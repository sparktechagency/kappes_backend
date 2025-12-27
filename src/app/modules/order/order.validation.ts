import { Types } from 'mongoose';
import { z } from 'zod';
import { DELIVERY_OPTIONS, ORDER_STATUS, PAYMENT_METHOD, PAYMENT_STATUS } from './order.enums';

// Validation schema for order product
const orderProductSchema = z.object({
     product: z.string().refine((val) => Types.ObjectId.isValid(val), {
          message: 'Invalid product ID',
     }),
     variant: z.string().refine((val) => Types.ObjectId.isValid(val), {
          message: 'Invalid variant ID',
     }),
     quantity: z.number().int().positive('Quantity must be a positive number'),
});

// Validation schema for creating an order
export const createOrderSchema = z.object({
     body: z.object({
          shop: z.string().refine((val) => Types.ObjectId.isValid(val), {
               message: 'Invalid shop ID',
          }),
          products: z.array(orderProductSchema).min(1, 'At least one product is required'),
          coupon: z.string().optional().nullable(),
          shippingAddress: z.string(),
          paymentMethod: z.nativeEnum(PAYMENT_METHOD, {
               required_error: 'Payment method is required',
               invalid_type_error: 'Invalid payment method',
          }),
          deliveryOptions: z
               .nativeEnum(DELIVERY_OPTIONS, {
                    required_error: 'Delivery options are required',
                    invalid_type_error: 'Invalid delivery options',
               })
               .optional(),

          cheapest_postage_type_requested: z.boolean().optional(),
          ship_date: z.string().optional(),
     }),
});

// Validation schema for updating order status
export const updateOrderStatusSchema = z.object({
     body: z.object({
          status: z.nativeEnum(ORDER_STATUS, {
               required_error: 'Status is required',
               invalid_type_error: 'Invalid status',
          }),
     }),
});

// Validation schema for updating payment status
export const updatePaymentStatusSchema = z.object({
     body: z.object({
          paymentStatus: z.nativeEnum(PAYMENT_STATUS, {
               required_error: 'Payment status is required',
               invalid_type_error: 'Invalid payment status',
          }),
     }),
});

export const OrderValidation = {
     createOrderSchema,
     updateOrderStatusSchema,
     updatePaymentStatusSchema,
};
