import { Document, Types } from 'mongoose';
import { DELIVERY_OPTIONS, ORDER_STATUS, PAYMENT_METHOD, PAYMENT_STATUS } from './order.enums';

export interface IOrderProduct {
     product: Types.ObjectId;
     variant: Types.ObjectId;
     quantity: number;
     unitPrice: number;
}

export interface IShippingAddress {
     toLowerCase: any;
     name?: string;

     addressLine1: string;
     addressLine2?: string;

     city: string;
     state: string;
     postalCode: string;

     country?: string;
     phone?: string;
}

export interface IOrder extends Document {
     _id: Types.ObjectId;
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
     shippingAddress: IShippingAddress;
     paymentMethod: PAYMENT_METHOD;
     paymentStatus: PAYMENT_STATUS;
     createdAt?: Date;
     updatedAt?: Date;
     payment?: Types.ObjectId;
     isNeedRefund: boolean;
}
