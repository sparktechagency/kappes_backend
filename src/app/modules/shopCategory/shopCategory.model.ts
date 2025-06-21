import { Schema, model } from "mongoose";
import { IShopCategory } from "./shopCategory.interface";

const shopCategorySchema = new Schema<IShopCategory>(
  {
    name: {
      type: String,
      required: [true, "Shop category name is required"],
      unique: true,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const ShopCategory = model<IShopCategory>("ShopCategory", shopCategorySchema);
