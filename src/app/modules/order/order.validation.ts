import { Types } from 'mongoose';
import { z } from 'zod';
import { DELIVERY_OPTIONS, DeliveryPlatformEnum, ORDER_STATUS, PAYMENT_METHOD, PAYMENT_STATUS } from './order.enums';
import { chitchat_cheapest_postage_type_requested, chitChatShipment_postage_type } from '../third-party-modules/chitChatShipment/chitChatShipment.enum';

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
     body: z
          .object({
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
               deliveryPlatForm: z.nativeEnum(DeliveryPlatformEnum),
               // for chitchat
               cheapest_postage_type_requested: z.nativeEnum(chitchat_cheapest_postage_type_requested).optional(),
               ship_date: z.string().optional(),
               chitchats_shipping_id: z.string(),
               chitchats_postage_type: z.nativeEnum(chitChatShipment_postage_type),
          })
          .superRefine((data, ctx) => {
               if (data.deliveryPlatForm === DeliveryPlatformEnum.CHITCHAT) {
                    if (!data.chitchats_shipping_id || !data.ship_date || !data.chitchats_postage_type) {
                         ctx.addIssue({
                              path: ['chitchats_shipping_id'],
                              message: 'ChitChat shipping ID, ship date, and postage type are required when delivery platform is ChitChat',
                              code: z.ZodIssueCode.custom,
                         });
                    }
               }
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
