import { Schema, model } from 'mongoose';
import { IPayment } from './payment.interface';
import { PAYMENT_METHOD, PAYMENT_STATUS } from '../order/order.enums';

const paymentSchema = new Schema<IPayment>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    order: {
      type: Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
    },
    shop: {
      type: Schema.Types.ObjectId,
      ref: 'Shop',
      required: true,
    },
    method: {
      type: String,
      enum: PAYMENT_METHOD,
      required: true,
      default: PAYMENT_METHOD.ONLINE,
    },
    status: {
      type: String,
      enum: PAYMENT_STATUS,
      required: true,
      default: PAYMENT_STATUS.PENDING,
    },
    transactionId: {
      type: String,
      default: null,
    },
    paymentIntent: {
      type: String,
      default: null,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    gatewayResponse: {
      type: Schema.Types.Mixed,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export const Payment = model<IPayment>('Payment', paymentSchema);
