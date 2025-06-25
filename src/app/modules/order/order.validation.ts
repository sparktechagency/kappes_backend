import { z } from 'zod';
import { Types } from 'mongoose';
import { ORDER_STATUS, PAYMENT_METHOD, PAYMENT_STATUS } from './order.enums';

// Validation schema for order product
const orderProductSchema = z.object({
  product: z.string().refine((val) => Types.ObjectId.isValid(val), {
    message: 'Invalid product ID',
  }),
  variant: z.string().refine((val) => Types.ObjectId.isValid(val), {
    message: 'Invalid variant ID',
  }),
  quantity: z.number().int().positive('Quantity must be a positive number'),
  unitPrice: z.number().nonnegative('Unit price cannot be negative'),
});

// Validation schema for creating an order
export const createOrderSchema = z.object({
  body: z.object({
    shop: z.string().refine((val) => Types.ObjectId.isValid(val), {
      message: 'Invalid shop ID',
    }),
    products: z
      .array(orderProductSchema)
      .min(1, 'At least one product is required'),
    coupon: z
      .string()
      .refine((val) => !val || Types.ObjectId.isValid(val), {
        message: 'Invalid coupon ID',
      })
      .optional()
      .nullable(),
    shippingAddress: z
      .string()
      .min(10, 'Shipping address must be at least 10 characters long'),
    paymentMethod: z.nativeEnum(PAYMENT_METHOD, {
      required_error: 'Payment method is required',
      invalid_type_error: 'Invalid payment method',
    }),
  }),
});

// Validation schema for updating order status
export const updateOrderStatusSchema = z.object({
  params: z.object({
    id: z.string().refine((val) => Types.ObjectId.isValid(val), {
      message: 'Invalid order ID',
    }),
  }),
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
}