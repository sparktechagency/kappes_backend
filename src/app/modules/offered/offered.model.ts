import { Schema, model } from "mongoose";
import { IOffered } from "./offered.interface";

const offeredSchema = new Schema<IOffered>(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: [true, "Product ID is required"],
    },
    discountPercentage: {
      type: Number,
      required: [true, "Discount percentage is required"],
      min: 0,
      max: 100,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"]
    },
  },
  { timestamps: true }
);

export const Offered = model<IOffered>("Offered", offeredSchema);
