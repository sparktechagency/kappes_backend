import mongoose from 'mongoose';
import { IReview } from './review.interface';
import { Review } from './review.model';
import { StatusCodes } from 'http-status-codes';
import { User } from '../user/user.model';
import AppError from '../../../errors/AppError';
import { Product } from '../product/product.model';
import { IJwtPayload } from '../auth/auth.interface';
import { IProduct } from '../product/product.interface';
import { Order } from '../order/order.model';
import { ORDER_STATUS } from '../order/order.enums';
import QueryBuilder from '../../builder/QueryBuilder';
import { Shop } from '../shop/shop.model';
import { USER_ROLES } from '../user/user.enums';
import { IBusiness } from '../business/business.interface';
import { Business } from '../business/business.model';


const createProductReviewToDB = async (payload: IReview, user: IJwtPayload): Promise<IReview> => {
     // Fetch product and check if it exists in one query
     const product: IProduct | null = await Product.findById(payload.refferenceId);
     if (!product) {
          throw new AppError(StatusCodes.NOT_FOUND, 'No Product Found');
     }

     const rating = Number(payload.rating);
     if (rating) {
          // checking the rating is valid or not;
          if (rating < 1 || rating > 5) {
               throw new AppError(StatusCodes.BAD_REQUEST, 'Invalid rating value');
          }
     }

     // Check if the user has a completed order that includes this product
     const completedOrderByProduct = await Order.findOne({
          user: user.id,
          products: { $elemMatch: { product: product._id } },
          status: ORDER_STATUS.COMPLETED,
     });

     if (!completedOrderByProduct) {
          throw new AppError(
               StatusCodes.UNAUTHORIZED,
               'You are not eligible to write a review because you have not purchased this product'
          );
     }

     // Check if user already has a review for this product
     const existingReview = await Review.findOne({
          customer: user.id,
          refferenceId: payload.refferenceId,
          isDeleted: false
     });

     let result;
     let previousRating = 0;

     if (existingReview) {
          // Store the previous rating for recalculation
          previousRating = existingReview.rating;

          // Update the existing review
          existingReview.rating = rating;
          existingReview.comment = payload.comment;
          // Update any other fields you want to allow updating
          result = await existingReview.save();
     } else {
          // Create new review
          result = await Review.create({ ...payload, customer: user.id });
     }

     if (!result) {
          throw new AppError(StatusCodes.BAD_REQUEST, 'Failed to process review');
     }

     // Calculate new average rating
     let newRating;
     let reviewCount = product.totalReviews;

     if (existingReview) {
          // If updating existing review, adjust the average by removing the old rating
          const totalRating = (product.avg_rating * reviewCount) - previousRating + rating;
          newRating = totalRating / reviewCount;
     } else {
          // If new review, increment count and calculate new average
          reviewCount = product.totalReviews + 1;
          newRating = product.avg_rating
               ? (product.avg_rating * product.totalReviews + rating) / reviewCount
               : rating;
     }

     // Update product's rating and total reviews count
     product.avg_rating = newRating;
     product.totalReviews = reviewCount;

     // If it's a new review, add it to the product's reviews array
     if (!existingReview) {
          product.reviews.push(result._id);
     }

     await product.save();

     return result;
};

const getProductReviews = async (productId: string, query: Record<string, unknown>) => {
     // const queryBuilder = new QueryBuilder(Review.find({ refferenceId: productId }), query);
     // const reviews = await queryBuilder.modelQuery;
     // const meta = await queryBuilder.countTotal();
     // return { reviews, meta };

     const reviewQuery = new QueryBuilder(
          Review.find({ refferenceId: productId }).populate({
               path: 'refferenceId',
               model: 'Product',
               match: {
                    isDeleted: false,
               },
               select: 'shopId',
          }),
          query
     )
          .paginate()
          .filter()
          .sort();

     const reviews = await reviewQuery.modelQuery.lean();

     const meta = await reviewQuery.countTotal();

     return {
          meta,
          result: reviews,
     };
};

const deleteProductReview = async (reviewId: string, user: IJwtPayload) => {
     const existingReview = await Review.findOne({ _id: reviewId, isDeleted: false });
     if (!existingReview) {
          throw new AppError(StatusCodes.NOT_FOUND, 'Review not found');
     }

     const product = await Product.findById(existingReview.refferenceId).populate('shopId');
     if (!product) {
          throw new AppError(StatusCodes.NOT_FOUND, 'Product not found');
     }
     const shop = await Shop.findById(product.shopId);
     if (!shop) {
          throw new AppError(StatusCodes.NOT_FOUND, 'Shop not found');
     }

     if (user.role === USER_ROLES.VENDOR || user.role === USER_ROLES.SHOP_ADMIN) {
          if (shop.owner.toString() !== user.id && !shop.admins?.some(admin => admin.toString() === user.id)) {
               throw new AppError(StatusCodes.FORBIDDEN, 'You are not authorized to create a product for this shop');
          }
     }

     await Review.updateOne({ _id: reviewId }, { isDeleted: true });

     // Recalculate the product's average rating and total reviews count
     const reviewCount = product.totalReviews - 1;
     const populatedReviews = await Review.find({ '_id': { $in: product.reviews } }).exec();
     const totalRating = populatedReviews.reduce((acc: number, review: IReview) => acc + review.rating, 0);
     const newRating = reviewCount > 0 ? totalRating / reviewCount : 0;

     product.totalReviews = reviewCount;
     product.avg_rating = newRating;
     product.reviews = product.reviews.filter(reviewId => reviewId.toString() !== existingReview._id.toString());

     await product.save();

     return existingReview;
};

const getAllProductReviewsByVendorAndShopAdmin = async (query: Record<string, unknown>) => {
     const reviewQuery = new QueryBuilder(
          Review.find({}),
          query
     )
          .paginate()
          .filter()
          .sort();

     const reviews = await reviewQuery.modelQuery.lean();

     const meta = await reviewQuery.countTotal();

     return {
          meta,
          result: reviews,
     };
};

const getShopProductsReviews = async (shopId: string, query: Record<string, unknown>, user: IJwtPayload) => {

     const shop = await Shop.findById(shopId);
     if (!shop) {
          throw new AppError(StatusCodes.NOT_FOUND, 'Shop not found');
     }

     if (user.role === USER_ROLES.VENDOR || user.role === USER_ROLES.SHOP_ADMIN) {
          if (shop.owner.toString() !== user.id && !shop.admins?.some(admin => admin.toString() === user.id)) {
               throw new AppError(StatusCodes.FORBIDDEN, 'You are not authorized to create a product for this shop');
          }
     }


     const reviewQuery = new QueryBuilder(
          Review.find().populate({
               path: 'refferenceId',
               model: 'Product',
               match: {
                    isDeleted: false,
               },
               select: 'shopId',
          }),
          query
     )
          .paginate()
          .filter()
          .sort();

     const reviews = await reviewQuery.modelQuery.lean();

     const filteredReviews = reviews.filter((review: any) => review.refferenceId.shopId.toString() === shopId.toString());

     const pageSize = Number(query.pageSize) || 10;
     const page = Number(query.page) || 1;
     const startIndex = (page - 1) * pageSize;
     const endIndex = page * pageSize;

     const filteredReviewsPaginated = filteredReviews.slice(startIndex, endIndex);

     const meta = {
          total: filteredReviews.length,
          limit: pageSize,
          page,
          totalPage: Math.ceil(filteredReviews.length / pageSize),
     };


     return {
          meta,
          result: filteredReviewsPaginated,
     };
};


const createBusinessReview = async (payload: IReview, user: IJwtPayload): Promise<IReview> => {
     const business: IBusiness | null = await Business.findById(payload.refferenceId);
     if (!business) {
          throw new AppError(StatusCodes.NOT_FOUND, 'No Business Found');
     }

     const rating = Number(payload.rating);
     if (rating) {
          // checking the rating is valid or not;
          if (rating < 1 || rating > 5) {
               throw new AppError(StatusCodes.BAD_REQUEST, 'Invalid rating value');
          }
     }

     // Check if user already has a review for this product
     const existingReview = await Review.findOne({
          customer: user.id,
          refferenceId: payload.refferenceId,
          isDeleted: false
     });

     let result;
     let previousRating = 0;

     if (existingReview) {
          // Store the previous rating for recalculation
          previousRating = existingReview.rating;

          // Update the existing review
          existingReview.rating = rating;
          existingReview.comment = payload.comment;
          // Update any other fields you want to allow updating
          result = await existingReview.save();
     } else {
          // Create new review
          result = await Review.create({ ...payload, customer: user.id, isApproved: false });
     }

     if (!result) {
          throw new AppError(StatusCodes.BAD_REQUEST, 'Failed to process review');
     }

     // Calculate new average rating
     let newRating;
     let reviewCount = business.totalReviews;

     if (existingReview) {
          // If updating existing review, adjust the average by removing the old rating
          const totalRating = (business.avg_rating * reviewCount) - previousRating + rating;
          newRating = totalRating / reviewCount;
     } else {
          // If new review, increment count and calculate new average
          reviewCount = business.totalReviews + 1;
          newRating = business.avg_rating
               ? (business.avg_rating * business.totalReviews + rating) / reviewCount
               : rating;
     }

     business.avg_rating = newRating;
     business.totalReviews = reviewCount;

     // If it's a new review, add it to the product's reviews array
     if (!existingReview) {
          business.reviews.push(result._id);
     }

     await business.save();

     return result;
};



const toggleApprovedBusinessReviewByOwner = async (reviewId: string, user: IJwtPayload) => {
     const review = await Review.findById(reviewId);
     if (!review) {
          throw new AppError(StatusCodes.NOT_FOUND, 'No Review Found');
     }

     const isExistBusiness = await Business.findById(review.refferenceId);
     if (!isExistBusiness) {
          throw new AppError(StatusCodes.NOT_FOUND, 'No Business Found');
     }

     if (isExistBusiness.owner.toString() !== user.id.toString()) {
          throw new AppError(
               StatusCodes.UNAUTHORIZED,
               'You are not authorized to toggle approval of this review'
          );
     }

     review.isApproved = !review.isApproved;

     await review.save();

     return review;
};

const getApprovedBusinessReviews = async (businessId: string, query: Record<string, unknown>) => {
     const reviewQuery = new QueryBuilder(
          Review.find({ refferenceId: businessId, isApproved: true }).populate({
               path: 'refferenceId',
               model: 'Business',
               match: {
                    isDeleted: false,
               },
               select: 'owner',
          }).populate({
               path: 'customer',
               model: 'User',
               match: {
                    isDeleted: false,
               },
               select: 'full_name email',
          }),
          query
     )
          .paginate()
          .filter()
          .sort();

     const reviews = await reviewQuery.modelQuery.lean();

     const meta = await reviewQuery.countTotal();

     return {
          meta,
          result: reviews,
     };
};

const deleteBusinessReviewByOwner = async (reviewId: string, user: IJwtPayload) => {
     const existingReview = await Review.findById(reviewId);
     if (!existingReview) {
          throw new AppError(StatusCodes.NOT_FOUND, 'No Review Found');
     }

     const isExistBusiness: IBusiness | null = await Business.findById(existingReview.refferenceId).populate("owner", "full_name email");
     if (!isExistBusiness) {
          throw new AppError(StatusCodes.NOT_FOUND, 'No Business Found');
     }
     if (isExistBusiness.owner.toString() !== user.id.toString()) {
          throw new AppError(
               StatusCodes.UNAUTHORIZED,
               'You are not authorized to delete this review'
          );
     }

     await Review.updateOne({ _id: reviewId }, { isDeleted: true });

     // Recalculate the business's average rating and total reviews count
     const reviewCount = isExistBusiness.totalReviews - 1;
     const populatedReviews = await Review.find({ '_id': { $in: isExistBusiness.reviews } }).exec();
     const totalRating = populatedReviews.reduce((acc: number, review: IReview) => acc + review.rating, 0);
     const newRating = reviewCount > 0 ? totalRating / reviewCount : 0;

     isExistBusiness.totalReviews = reviewCount;
     isExistBusiness.avg_rating = newRating;
     isExistBusiness.reviews = isExistBusiness.reviews.filter(reviewId => reviewId.toString() !== reviewId.toString());

     await isExistBusiness.save();

     return existingReview;
};


const getAllBusinessReviewsByOwner = async (user: IJwtPayload) => {
     /**
      * get all the busness of this users
      * and get all the reviews of those busines populating business name and owener full_name,email
      * res as per businesswise array
      * 
      */
     const businesses = await Business.find({ owner: user.id, isDeleted: false });
     if (!businesses || businesses.length === 0) {
          throw new AppError(StatusCodes.NOT_FOUND, 'No Business Found');
     }
     const businessIds = businesses.map((business) => business._id);
     const reviews = await Review.find({ refferenceId: { $in: businessIds } }).populate({
          path: 'refferenceId',
          model: 'Business',
          match: {
               isDeleted: false,
          },
          select: 'owner isApproved name email address working_hours',
     })

     return businesses.map((business: IBusiness) => {
          return {
               business,
               reviews: reviews.filter((review: IReview) => review.refferenceId.toString() === business._id.toString()),
          };
     });
};

export const ReviewService = { createProductReviewToDB, getProductReviews, deleteProductReview, getAllProductReviewsByVendorAndShopAdmin, getShopProductsReviews, createBusinessReview, getApprovedBusinessReviews, deleteBusinessReviewByOwner, toggleApprovedBusinessReviewByOwner, getAllBusinessReviewsByOwner };
