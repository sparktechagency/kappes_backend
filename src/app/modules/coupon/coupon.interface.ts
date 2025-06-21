import mongoose from "mongoose";

export interface ICoupon extends Document {
  code: string;
  name: string;
  description?: string;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
  maxDiscountAmount?: number;
  minOrderAmount?: number;
  validFrom: Date;
  validTo: Date;
  usageLimit?: number;
  usedCount: number;
  userUsageLimit?: number;
  shopId?: mongoose.Types.ObjectId;
  applicableProducts?: mongoose.Types.ObjectId[];
  applicableCategories?: mongoose.Types.ObjectId[];
  isActive: boolean;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}