import { model, Schema } from "mongoose";
import { IProduct } from "./product.interface";

/* 

export interface IProductSingleVariant {
    variantId: mongoose.Types.ObjectId;
    variantQuantity: number;
    variantPrice: number;
},{_id:false}
    product_variant_Details: IProductSingleVariant[];
*/

let productSchema = new Schema<IProduct>(
  {});

export const Product = model<IProduct>("Product", productSchema);
