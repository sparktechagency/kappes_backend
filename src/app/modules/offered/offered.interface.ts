import { Types } from "mongoose";

export interface IOffered {
  product: Types.ObjectId;
  discountPercentage: number;
  createdBy?: Types.ObjectId
}

export interface ICreateOfferedInput {
  products: string[];
  discountPercentage: number;
}