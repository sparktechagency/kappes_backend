// src/app/modules/cart/cart.interface.ts
import { Document, Types } from "mongoose";
import { IProduct } from "../product/product.interface";
import { IVariant } from "../variant/variant.interfaces";

export interface ICartItem {
    _id?: Types.ObjectId;
    productId: Types.ObjectId | IProduct;
    variantId: Types.ObjectId | IVariant;
    variantPrice: number;
    variantQuantity: number;
    totalPrice: number;
}

export interface ICart extends Document {
    userId: Types.ObjectId;
    items: ICartItem[];
    createdAt: Date;
    updatedAt: Date;
}