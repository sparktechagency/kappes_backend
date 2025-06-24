import mongoose from "mongoose";
import { COUPON_DISCOUNT_TYPE } from "./coupon.enums";

export interface ICoupon extends Document {
  code: string;
  shopId: mongoose.Types.ObjectId;
  discountType: COUPON_DISCOUNT_TYPE;
  discountValue: number;
  maxDiscountAmount?: number;
  startDate: Date;
  endDate: Date;
  minOrderAmount?: number;
  isActive: boolean;
  isDeleted: boolean;
  // aboves are of next hero ⬆️⬆️
  createdBy: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  // usageLimit?: number;
  // usedCount: number;
  // userUsageLimit?: number;
  // applicableProducts?: mongoose.Types.ObjectId[];
  // applicableCategories?: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}