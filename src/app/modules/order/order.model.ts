import { Schema, model } from "mongoose";
import { IOrder } from "./order.interface";
import { Product } from "../product/product.model";
import { Coupon } from "../coupon/coupon.model";
import { StatusCodes } from "http-status-codes";
import AppError from "../../../errors/AppError";

const orderSchema = new Schema<IOrder>(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        shop: {
            type: Schema.Types.ObjectId,
            ref: "Shop",
            required: true,
        },
        products: [
            {
                product: {
                    type: Schema.Types.ObjectId,
                    ref: "Product",
                    required: true,
                },
                variant: {
                    type: Schema.Types.ObjectId,
                    ref: "ProductVariant",
                    required: true,
                },
                quantity: {
                    type: Number,
                    required: true,
                    min: 1,
                },
                unitPrice: {
                    type: Number,
                    required: true,
                },
            },
        ],
        coupon: {
            type: Schema.Types.ObjectId,
            ref: "Coupon",
            default: null,
        },
        totalAmount: {
            type: Number,
            required: true,
            min: 0,
        },
        discount: {
            type: Number,
            default: 0,
            min: 0,
        },
        deliveryCharge: {
            type: Number,
            default: 0,
        },
        finalAmount: {
            type: Number,
            required: true,
            min: 0,
        },
        status: {
            type: String,
            enum: ["Pending", "Processing", "Completed", "Cancelled"],
            default: "Pending",
        },
        shippingAddress: {
            type: String,
            required: true,
        },
        paymentMethod: {
            type: String,
            enum: ["COD", "Online"],
            default: "Online",
        },
        paymentStatus: {
            type: String,
            enum: ["Pending", "Paid", "Failed"],
            default: "Pending",
        },
    },
    {
        timestamps: true,
    }
);

// Pre-save hook to calculate total, discount, delivery charge, and final price
orderSchema.pre("validate", async function (next) {
    const order = this;

    // Step 1: Initialize total amount
    let totalAmount = 0;
    let finalDiscount = 0;
    let shopId: Schema.Types.ObjectId | null = null;

    // Step 2: Calculate total amount for products
    for (let item of order.products) {
        const product = await Product.findById(item.product).populate("shop");

        if (!product) {
            return next(new Error(`Product not found!.`));
        }
        const variant = await Product.findById(item.variant).populate("shop");

        if (!variant) {
            return next(new Error(`variant not found!.`));
        }


        // check if ths vairant is in the product.product_variant_Details array if present then check variantQuantity of that item in product.product_variant_Details array
        const variantIndex = product.product_variant_Details.findIndex(
            itm => itm.variantId.toString() === item.variant.toString()
        );

        if (variantIndex === -1) {
            return next(new Error(`Variant not found in product with ID: ${item.product}`));
        }

        if (product.product_variant_Details[variantIndex].variantQuantity < item.quantity) {
            return next(new Error(`Variant quantity is not available in product with ID: ${item.product}`));
        }

        if (shopId && String(shopId) !== String(product.shopId._id)) {
            return next(new Error("Products must be from the same shop."));
        }

        //@ts-ignore
        shopId = product.shopId._id;

        const offerPrice = (await product?.calculateOfferPrice()) || 0;

        let productPrice = product.basePrice;
        if (offerPrice) productPrice = Number(offerPrice);

        item.unitPrice = productPrice;
        const price = productPrice * item.quantity;
        console.log(price);
        totalAmount += price;
    }

    if (order.coupon) {
        const couponDetails = await Coupon.findById(order.coupon);
        if (String(shopId) === couponDetails?.shopId.toString()) {
            throw new AppError(StatusCodes.BAD_REQUEST, "The coupon is not applicable for your selected products")
        }
        if (couponDetails && couponDetails.isActive) {
            if (couponDetails?.minOrderAmount && totalAmount >= couponDetails?.minOrderAmount) {
                if (couponDetails.discountType === "Percentage") {
                    finalDiscount = Math.min(
                        (couponDetails.discountValue / 100) * totalAmount,
                        couponDetails.maxDiscountAmount
                            ? couponDetails.maxDiscountAmount
                            : Infinity
                    );
                } else if (couponDetails.discountType === "Flat") {
                    finalDiscount = Math.min(couponDetails.discountValue, totalAmount);
                }
            }
        }
    }

    const isDhaka = order?.shippingAddress?.toLowerCase()?.includes("dhaka");
    const deliveryCharge = isDhaka ? 60 : 120;

    order.totalAmount = totalAmount;
    order.discount = finalDiscount;
    order.deliveryCharge = deliveryCharge;
    order.finalAmount = totalAmount - finalDiscount + deliveryCharge;
    //@ts-ignore
    order.shop = shopId;

    next();
});

export const Order = model<IOrder>("Order", orderSchema);
