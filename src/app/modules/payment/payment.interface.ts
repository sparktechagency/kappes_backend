import { Types } from 'mongoose';
import { PAYMENT_METHOD, PAYMENT_STATUS } from '../order/order.enums';

export interface IPayment {
  user: Types.ObjectId;
  order: Types.ObjectId;
  shop: Types.ObjectId;
  method: PAYMENT_METHOD;
  status: PAYMENT_STATUS;
  transactionId?: string;
  paymentIntent?: string;
  amount: number;
  gatewayResponse?: Record<string, any>;
  createdAt?: Date;
  updatedAt?: Date;
  isDeleted?: boolean;
}
