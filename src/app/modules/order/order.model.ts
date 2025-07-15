import { StatusCodes } from 'http-status-codes';
import { Schema, model } from 'mongoose';
import AppError from '../../../errors/AppError';
import { COUPON_DISCOUNT_TYPE } from '../coupon/coupon.enums';
import { Coupon } from '../coupon/coupon.model';
import { Product } from '../product/product.model';
import {
     CENTRAL_SHIPPING_AREA,
     COUNTRY_SHIPPING_AREA,
     DDAY_FOR_DELIVERY_OPTIONS,
     DELIVERY_OPTIONS,
     EXTRA_DELIVERY_COST_PERCENT_FOR_DELIVERY_OPTIONS,
     FREE_SHIPPING_CHARGE_AREA,
     ORDER_STATUS,
     PAYMENT_METHOD,
     PAYMENT_STATUS,
     SHIPPING_COST,
} from './order.enums';
import { IOrder } from './order.interface';

const orderSchema = new Schema<IOrder>(
     {
          user: {
               type: Schema.Types.ObjectId,
               ref: 'User',
               required: true,
          },
          shop: {
               type: Schema.Types.ObjectId,
               ref: 'Shop',
               required: true,
          },
          products: [
               {
                    product: {
                         type: Schema.Types.ObjectId,
                         ref: 'Product',
                         required: true,
                    },
                    variant: {
                         type: Schema.Types.ObjectId,
                         ref: 'ProductVariant',
                         required: true,
                    },
                    quantity: {
                         type: Number,
                         required: true,
                         min: 1,
                    },
                    unitPrice: {
                         type: Number,
                         required: true,
                    },
               },
          ],
          deliveryOptions: {
               type: String,
               enum: Object.values(DELIVERY_OPTIONS),
               default: DELIVERY_OPTIONS.STANDARD,
          },
          deliveryDate: {
               type: Date,
          },
          coupon: {
               type: Schema.Types.ObjectId,
               ref: 'Coupon',
               default: null,
          },
          totalAmount: {
               type: Number,
               required: true,
               min: 0,
          },
          discount: {
               type: Number,
               default: 0,
               min: 0,
          },
          deliveryCharge: {
               type: Number,
               default: 0,
          },
          finalAmount: {
               type: Number,
               required: true,
               min: 0,
          },
          status: {
               type: String,
               enum: ORDER_STATUS,
               default: ORDER_STATUS.PENDING,
          },
          shippingAddress: {
               type: String,
               required: true,
          },
          paymentMethod: {
               type: String,
               enum: PAYMENT_METHOD,
               default: PAYMENT_METHOD.ONLINE,
          },
          paymentStatus: {
               type: String,
               enum: PAYMENT_STATUS,
               default: PAYMENT_STATUS.UNPAID,
          },
          payment: {
               type: Schema.Types.ObjectId,
               ref: 'Payment',
               default: null,
          },
          isPaymentTransferdToVendor: {
               type: Boolean,
               default: false,
          },
          isNeedRefund: {
               type: Boolean,
               default: false,
          },
     },
     {
          timestamps: true,
     },
);

// Pre-save hook to calculate total, discount, delivery charge, and final price
orderSchema.pre('validate', async function (next) {
     const order = this;

     // Step 1: Initialize total amount
     let totalAmount = 0;
     let finalDiscount = 0;
     let shopId: Schema.Types.ObjectId | null = null;

     // Step 2: Calculate total amount for products
     for (const item of order.products) {
          const product = await Product.findById(item.product).populate('shopId');

          if (!product) {
               return next(new Error(`Product not found!.`));
          }

          if (shopId && String(shopId) !== String(product.shopId._id)) {
               return next(new Error('Products must be from the same shop.'));
          }

          //@ts-ignore
          shopId = product.shopId._id;

          const offerPrice = (await product?.calculateOfferPrice()) || 0;

          let productPrice = product.basePrice;
          if (offerPrice) productPrice = Number(offerPrice);

          item.unitPrice = productPrice;
          const price = productPrice * item.quantity;
          totalAmount += price;
     }

     if (order.coupon) {
          const couponDetails = await Coupon.findById(order.coupon);
          if (String(shopId) !== couponDetails?.shopId.toString()) {
               throw new AppError(StatusCodes.BAD_REQUEST, 'The coupon is not applicable for your selected products');
          }
          if (couponDetails && couponDetails.isActive) {
               if (couponDetails?.minOrderAmount && totalAmount >= couponDetails?.minOrderAmount) {
                    if (couponDetails.discountType === COUPON_DISCOUNT_TYPE.PERCENTAGE) {
                         finalDiscount = Math.min((couponDetails.discountValue / 100) * totalAmount, couponDetails.maxDiscountAmount ? couponDetails.maxDiscountAmount : Infinity);
                    } else if (couponDetails.discountType === COUPON_DISCOUNT_TYPE.FLAT) {
                         finalDiscount = Math.min(couponDetails.discountValue, totalAmount);
                    }
               }
          }
     }

     // Step 3: Calculate delivery charge based on shipping address and delivery options
     const shippingAdressLowerCased = order?.shippingAddress?.toLowerCase();
     let deliveryCharge = SHIPPING_COST.WORLD_WIDE;
     if (FREE_SHIPPING_CHARGE_AREA.some((area) => shippingAdressLowerCased?.includes(area))) {
          deliveryCharge = SHIPPING_COST.FREE;
     } else if (CENTRAL_SHIPPING_AREA.some((area) => shippingAdressLowerCased?.includes(area))) {
          deliveryCharge = SHIPPING_COST.CENTRAL;
     } else if (COUNTRY_SHIPPING_AREA.some((area) => shippingAdressLowerCased?.includes(area))) {
          deliveryCharge = SHIPPING_COST.COUNTRY;
     }
     // Additional delivery cost based on delivery options
     if (order.deliveryOptions === DELIVERY_OPTIONS.EXPRESS) {
          deliveryCharge += (deliveryCharge * EXTRA_DELIVERY_COST_PERCENT_FOR_DELIVERY_OPTIONS.EXPRESS) / 100;
     } else if (order.deliveryOptions === DELIVERY_OPTIONS.OVERNIGHT) {
          deliveryCharge += (deliveryCharge * EXTRA_DELIVERY_COST_PERCENT_FOR_DELIVERY_OPTIONS.OVERNIGHT) / 100;
     } else {
          deliveryCharge += (deliveryCharge * EXTRA_DELIVERY_COST_PERCENT_FOR_DELIVERY_OPTIONS.STANDARD) / 100;
     }

     order.totalAmount = totalAmount;
     order.discount = finalDiscount;
     order.deliveryCharge = deliveryCharge;
     order.finalAmount = totalAmount - finalDiscount + deliveryCharge;
     //@ts-ignore
     order.shop = shopId;
     next();
});

// MIDDLEWARES TO define delivery date based on delivery options
orderSchema.pre('save', function (next) {
     if (this.deliveryOptions === DELIVERY_OPTIONS.EXPRESS) {
          this.deliveryDate = new Date(Date.now() + Number(DDAY_FOR_DELIVERY_OPTIONS.EXPRESS) * 24 * 60 * 60 * 1000);
     } else if (this.deliveryOptions === DELIVERY_OPTIONS.OVERNIGHT) {
          this.deliveryDate = new Date(Date.now() + Number(DDAY_FOR_DELIVERY_OPTIONS.OVERNIGHT) * 24 * 60 * 60 * 1000);
     } else {
          this.deliveryDate = new Date(Date.now() + Number(DDAY_FOR_DELIVERY_OPTIONS.STANDARD) * 24 * 60 * 60 * 1000);
     }
     next();
});

export const Order = model<IOrder>('Order', orderSchema);
