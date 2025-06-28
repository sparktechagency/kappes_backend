import { Types } from 'mongoose';
import { IWishlist, IWishlistItem } from './wishlist.interface';
import { Wishlist } from './wishlist.model';
import AppError from '../../../errors/AppError';
import { StatusCodes } from 'http-status-codes';

const addToWishlist = async (userId: string, productId: string): Promise<IWishlist> => {
    let wishlist = await Wishlist.findOne({ user: userId });

    if (!wishlist) {
        wishlist = await Wishlist.create({
            user: userId,
            items: [{ product: productId }],
        });
    } else {
        const itemExists = wishlist.items.some((item: IWishlistItem) =>
            item.product.toString() === productId
        );

        if (itemExists) {
            throw new AppError(StatusCodes.BAD_REQUEST, 'Product already in wishlist');
        }

        wishlist.items.push({ product: new Types.ObjectId(productId) });
        await wishlist.save();
    }

    return wishlist.populate('items.product');
};

const removeFromWishlist = async (userId: string, productId: string): Promise<IWishlist | null> => {
    const wishlist = await Wishlist.findOneAndUpdate(
        { user: userId },
        { $pull: { items: { product: productId } } },
        { new: true }
    ).populate('items.product');

    return wishlist;
};

const getWishlist = async (userId: string): Promise<IWishlist | null> => {
    return Wishlist.findOne({ user: userId }).populate('items.product');
};

const isProductInWishlist = async (userId: string, productId: string): Promise<boolean> => {
    return Wishlist.isProductInWishlist(
        new Types.ObjectId(userId),
        new Types.ObjectId(productId)
    );
};

export const WishlistService = {
    addToWishlist,
    removeFromWishlist,
    getWishlist,
    isProductInWishlist,
};