// src/app/modules/cart/cart.model.ts
import { Schema, model } from "mongoose";
import { ICart } from "./cart.interface";

const cartItemSchema = new Schema({
    productId: {
        type: Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    variantId: {
        type: Schema.Types.ObjectId,
        ref: 'Variant',
        required: true
    },
    variantPrice: {
        type: Number,
        required: true,
        min: 0
    },
    variantQuantity: {
        type: Number,
        required: true,
        min: 1
    },
    totalPrice: {
        type: Number,
        required: true,
        min: 0
    }
}, { _id: false });

const cartSchema = new Schema<ICart>({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    items: [cartItemSchema]
}, {
    timestamps: true
});

// Add index for better query performance
cartSchema.index({ userId: 1 });

// Add middleware to calculate total price
// cartSchema.pre('save', function (next) {
//     this.items.forEach(item => {
//         item.totalPrice = item.variantPrice * item.variantQuantity;
//     });
//     next();
// });

export const Cart = model<ICart>('Cart', cartSchema);