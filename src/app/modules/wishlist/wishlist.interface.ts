import { Document, Types } from 'mongoose';

export interface IWishlistItem {
  product: Types.ObjectId;
  addedAt: Date;
}

export interface IWishlist extends Document {
  user: Types.ObjectId;
  items: IWishlistItem[];
  createdAt: Date;
  updatedAt: Date;
}

export type IWishlistModel = {
  isProductInWishlist(userId: Types.ObjectId, productId: Types.ObjectId): Promise<boolean>;
} & typeof import('mongoose').Model<IWishlist>;