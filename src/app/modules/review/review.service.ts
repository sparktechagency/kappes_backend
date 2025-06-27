import mongoose from 'mongoose';
import { IReview } from './review.interface';
import { Review } from './review.model';
import { StatusCodes } from 'http-status-codes';
import { User } from '../user/user.model';
import AppError from '../../../errors/AppError';
import { Product } from '../product/product.model';
import { IJwtPayload } from '../auth/auth.interface';
import { IProduct } from '../product/product.interface';

const createProductReviewToDB = async (payload: IReview, user: IJwtPayload): Promise<IReview> => {
     // Fetch baber and check if it exists in one query
     const product: IProduct | null = await Product.findById(payload.refferenceId);
     if (!product) {
          throw new AppError(StatusCodes.NOT_FOUND, 'No User Found');
     }

     const rating = Number(payload.rating);
     if (rating) {
          // checking the rating is valid or not;
          if (rating < 1 || rating > 5) {
               throw new AppError(StatusCodes.BAD_REQUEST, 'Invalid rating value');
          }
     }


     const result = await Review.create(payload);
     if (!result) {
          throw new AppError(StatusCodes.BAD_REQUEST, 'Failed To create Review');
     }

     // Update service's rating and total ratings count
     const reviewCount = product.totalReviews + 1;

     let newRating;
     if (product.avg_rating === null || product.avg_rating === 0) {
          // If no previous ratings, the new rating is the first one
          newRating = rating;
     } else {
          // Calculate the new rating based on previous ratings
          newRating = (product.avg_rating * product.totalReviews + rating) / reviewCount;
     }

     // save the reivew info in product doc using save
     product.avg_rating = newRating;
     product.totalReviews = reviewCount;
     product.reviews.push(result._id);
     await product.save();

     return result;
};

export const ReviewService = { createProductReviewToDB };
