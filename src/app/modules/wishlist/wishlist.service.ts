import { StatusCodes } from 'http-status-codes';
import { Types } from 'mongoose';
import AppError from '../../../errors/AppError';
import QueryBuilder from '../../builder/QueryBuilder';
import { IWishlist, IWishlistItem } from './wishlist.interface';
import { Wishlist } from './wishlist.model';

const addToWishlist = async (userId: string, productId: string): Promise<IWishlist> => {
     let wishlist = await Wishlist.findOne({ user: userId });

     if (!wishlist) {
          wishlist = await Wishlist.create({
               user: userId,
               items: [{ product: productId }],
          });
     } else {
          const itemExists = wishlist.items.some((item: IWishlistItem) => item.product.toString() === productId);

          if (itemExists) {
               throw new AppError(StatusCodes.BAD_REQUEST, 'Product already in wishlist');
          }

          wishlist.items.push({ product: new Types.ObjectId(productId) });
          await wishlist.save();
     }

     return wishlist.populate('items.product');
};

const removeFromWishlist = async (userId: string, productId: string): Promise<IWishlist | null> => {
     const wishlist = await Wishlist.findOneAndUpdate({ user: userId }, { $pull: { items: { product: productId } } }, { new: true }).populate('items.product');

     return wishlist;
};

const getWishlist = async (userId: string, query: any) => {
     const querBuilder = new QueryBuilder(Wishlist.find({ user: userId }).populate('items.product'), query);

     const result = await querBuilder.fields().sort().paginate().filter().search(['items.product.name', 'items.product.description', 'items.product.price']).modelQuery; // Final query model

     const meta = await querBuilder.countTotal();
     return { result: result[0], meta };
};

const isProductInWishlist = async (userId: string, productId: string): Promise<boolean> => {
     return Wishlist.isProductInWishlist(new Types.ObjectId(userId), new Types.ObjectId(productId));
};

export const WishlistService = {
     addToWishlist,
     removeFromWishlist,
     getWishlist,
     isProductInWishlist,
};
