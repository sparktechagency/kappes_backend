import mongoose from 'mongoose';
import { IReview } from './review.interface';
import { Review } from './review.model';
import { StatusCodes } from 'http-status-codes';
import AppError from '../../../errors/AppError';
import { Product } from '../product/product.model';
import { IJwtPayload } from '../auth/auth.interface';
import { Order } from '../order/order.model';
import QueryBuilder from '../../builder/QueryBuilder';
import { Shop } from '../shop/shop.model';
import { USER_ROLES } from '../user/user.enums';
import { IBusiness } from '../business/business.interface';
import { Business } from '../business/business.model';
import unlinkFile from '../../../shared/unlinkFile';

const createProductReviewToDB = async (payload: IReview, user: IJwtPayload): Promise<IReview> => {
     const session = await mongoose.startSession();
     session.startTransaction();

     try {
          // 1. Find product
          const product = await Product.findById(payload.refferenceId).session(session);
          if (!product) throw new AppError(StatusCodes.NOT_FOUND, 'Product not found');

          // 2. Validate rating
          const rating = Number(payload.rating);
          if (rating && (rating < 1 || rating > 5)) {
               throw new AppError(StatusCodes.BAD_REQUEST, 'Rating must be between 1-5');
          }

          // 3. Check if user purchased the product
          const hasPurchased = await Order.exists({
               'user': user.id,
               'products.product': product._id,
               // status: ORDER_STATUS.COMPLETED
          }).session(session);

          if (!hasPurchased) {
               throw new AppError(StatusCodes.UNAUTHORIZED, 'Purchase product to review');
          }

          // 4. Find existing review
          let review = await Review.findOne({
               customer: user.id,
               refferenceId: payload.refferenceId,
               isDeleted: false,
          }).session(session);

          // 5. Create or update review
          if (review) {
               review.rating = rating;
               review.comment = payload.comment;
               review.images = payload.images;
               await review.save({ session });
          } else {
               // Create new review
               const newReview = await Review.create([{ ...payload, customer: user.id }], { session });
               review = newReview[0];
          }

          await product.save({ session });
          await session.commitTransaction();
          session.endSession();

          return review;
     } catch (error) {
          await session.abortTransaction();
          session.endSession();

          // Basic image cleanup
          if (payload.images?.length) {
               payload.images.forEach((image) => {
                    // Replace with your image deletion logic
                    console.log('Cleaning up image:', image);
                    unlinkFile(image); // Example for local files
               });
          }

          throw error;
     }
};

const getProductReviews = async (productId: string, query: Record<string, unknown>) => {
     // const queryBuilder = new QueryBuilder(Review.find({ refferenceId: productId }), query);
     // const reviews = await queryBuilder.modelQuery;
     // const meta = await queryBuilder.countTotal();
     // return { reviews, meta };

     const reviewQuery = new QueryBuilder(
          Review.find({ refferenceId: productId })
               .populate({
                    path: 'refferenceId',
                    model: 'Product',
                    match: {
                         isDeleted: false,
                    },
                    select: 'shopId',
               })
               .populate({
                    path: 'customer',
                    model: 'User',
                    match: {
                         isDeleted: false,
                    },
                    select: 'full_name email',
               }),
          query,
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
          if (shop.owner.toString() !== user.id && !shop.admins?.some((admin) => admin.toString() === user.id)) {
               throw new AppError(StatusCodes.FORBIDDEN, 'You are not authorized to create a product for this shop');
          }
     }

     await Review.updateOne({ _id: reviewId }, { isDeleted: true });

     // Recalculate the product's average rating and total reviews count
     const reviewCount = product.totalReviews - 1;
     const populatedReviews = await Review.find({ _id: { $in: product.reviews } }).exec();
     const totalRating = populatedReviews.reduce((acc: number, review: IReview) => acc + review.rating, 0);
     const newRating = reviewCount > 0 ? totalRating / reviewCount : 0;

     product.totalReviews = reviewCount;
     product.avg_rating = newRating;
     product.reviews = product.reviews.filter((reviewId) => reviewId.toString() !== existingReview._id.toString());

     await product.save();

     return existingReview;
};

const getAllProductReviewsByVendorAndShopAdmin = async (query: Record<string, unknown>) => {
     const reviewQuery = new QueryBuilder(Review.find({}), query).paginate().filter().sort();

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
          if (shop.owner.toString() !== user.id && !shop.admins?.some((admin) => admin.toString() === user.id)) {
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
          query,
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
          isDeleted: false,
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
          const totalRating = business.avg_rating * reviewCount - previousRating + rating;
          newRating = totalRating / reviewCount;
     } else {
          // If new review, increment count and calculate new average
          reviewCount = business.totalReviews + 1;
          newRating = business.avg_rating ? (business.avg_rating * business.totalReviews + rating) / reviewCount : rating;
     }

     business.avg_rating = newRating;
     business.totalReviews = reviewCount;

     // If it's a new review, add it to the product's reviews array
     if (!existingReview) {
          business.reviews.push(result._id);
     }

     await business.save();

     return result.populate({
          path: 'refferenceId',
          model: 'Business',
          match: {
               isDeleted: false,
          },
          select: 'owner name email address',
     });
};

const toggleApprovedBusinessReviewByOwner = async (reviewId: string, user: IJwtPayload) => {
     console.log({ reviewId });
     const review = await Review.findById(reviewId);
     console.log({ review });
     if (!review) {
          throw new AppError(StatusCodes.NOT_FOUND, 'No Review Found');
     }

     const isExistBusiness = await Business.findById(review.refferenceId);
     if (!isExistBusiness) {
          throw new AppError(StatusCodes.NOT_FOUND, 'No Business Found');
     }

     if (isExistBusiness.owner.toString() !== user.id.toString()) {
          throw new AppError(StatusCodes.UNAUTHORIZED, 'You are not authorized to toggle approval of this review');
     }

     review.isApproved = !review.isApproved;

     await review.save();

     return review;
};

const getApprovedBusinessReviews = async (businessId: string, query: Record<string, unknown>) => {
     const reviewQuery = new QueryBuilder(
          Review.find({ refferenceId: businessId, isApproved: true })
               .populate({
                    path: 'refferenceId',
                    model: 'Business',
                    match: {
                         isDeleted: false,
                    },
                    select: 'owner name email',
               })
               .populate({
                    path: 'customer',
                    model: 'User',
                    match: {
                         isDeleted: false,
                    },
                    select: 'full_name email',
               }),
          query,
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

     const isExistBusiness: IBusiness | null = await Business.findOne({ _id: existingReview.refferenceId, isDeleted: false, owner: user.id });
     if (!isExistBusiness) {
          throw new AppError(StatusCodes.NOT_FOUND, 'No Business Found');
     }
     if (isExistBusiness.owner.toString() !== user.id.toString()) {
          throw new AppError(StatusCodes.UNAUTHORIZED, 'You are not authorized to delete this review');
     }

     await Review.updateOne({ _id: reviewId }, { isDeleted: true });

     // Recalculate the business's average rating and total reviews count
     const reviewCount = isExistBusiness.totalReviews - 1;
     const populatedReviews = await Review.find({ _id: { $in: isExistBusiness.reviews } }).exec();
     const totalRating = populatedReviews.reduce((acc: number, review: IReview) => acc + review.rating, 0);
     const newRating = reviewCount > 0 ? totalRating / reviewCount : 0;

     isExistBusiness.totalReviews = reviewCount;
     isExistBusiness.avg_rating = newRating;
     isExistBusiness.reviews = isExistBusiness.reviews.filter((reviewId) => reviewId.toString() !== reviewId.toString());

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
     const businesses = await Business.find({ owner: user.id, isDeleted: false }).populate('reviews');
     if (!businesses || businesses.length === 0) {
          throw new AppError(StatusCodes.NOT_FOUND, 'No Business Found');
     }

     return businesses.map((business: IBusiness) => {
          return business;
     });
};

export const ReviewService = {
     createProductReviewToDB,
     getProductReviews,
     deleteProductReview,
     getAllProductReviewsByVendorAndShopAdmin,
     getShopProductsReviews,
     createBusinessReview,
     getApprovedBusinessReviews,
     deleteBusinessReviewByOwner,
     toggleApprovedBusinessReviewByOwner,
     getAllBusinessReviewsByOwner,
};
