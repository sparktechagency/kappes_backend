import { Schema, model } from 'mongoose';
import { IWishlist, IWishlistModel } from './wishlist.interface';

const wishlistItemSchema = new Schema({
  product: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  addedAt: {
    type: Date,
    default: Date.now,
  },
});

const wishlistSchema = new Schema<IWishlist, IWishlistModel>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    items: [wishlistItemSchema],
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
    },
  }
);

// Check if product is in user's wishlist
wishlistSchema.statics.isProductInWishlist = async function (
  userId: string,
  productId: string
): Promise<boolean> {
  const wishlist = await this.findOne({
    user: userId,
    'items.product': productId,
  });
  return !!wishlist;
};

export const Wishlist = model<IWishlist, IWishlistModel>('Wishlist', wishlistSchema);