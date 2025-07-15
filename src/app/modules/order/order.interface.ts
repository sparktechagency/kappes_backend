import { Document, Types } from 'mongoose';
import { DELIVERY_OPTIONS, ORDER_STATUS, PAYMENT_METHOD, PAYMENT_STATUS } from './order.enums';

export interface IOrderProduct {
     product: Types.ObjectId;
     variant: Types.ObjectId;
     quantity: number;
     unitPrice: number;
}

export interface IOrder extends Document {
     user: Types.ObjectId;
     shop: Types.ObjectId;
     products: IOrderProduct[];
     coupon: Types.ObjectId | null;
     deliveryOptions?: DELIVERY_OPTIONS;
     deliveryDate?: Date;
     totalAmount: number;
     discount: number;
     deliveryCharge: number;
     finalAmount: number;
     isPaymentTransferdToVendor: boolean;
     status: ORDER_STATUS;
     shippingAddress: string;
     paymentMethod: PAYMENT_METHOD;
     paymentStatus: PAYMENT_STATUS;
     createdAt?: Date;
     updatedAt?: Date;
     payment?: Types.ObjectId;
     isNeedRefund: boolean;
}
