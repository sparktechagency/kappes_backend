import { Document, Types } from "mongoose";

export interface IShopCategory extends Document {
  name: string;
  isActive: boolean;
  createdBy: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}