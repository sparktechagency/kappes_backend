import { model, Schema } from 'mongoose';
import { IReview, ReviewModel } from './review.interface';
import { StatusCodes } from 'http-status-codes';
import AppError from '../../../errors/AppError';
import { Product } from '../product/product.model';
import { REVIEW_TYPES } from './review.enums';
import { Business } from '../business/business.model';

const Service: any = [];

const reviewSchema = new Schema<IReview, ReviewModel>(
     {
          customer: {
               type: Schema.Types.ObjectId,
               ref: 'User',
               required: true,
          },
          comment: {
               type: String,
               required: true,
               trim: true,
               maxlength: 500,
          },
          rating: {
               type: Number,
               required: true,
               min: 1,
               max: 5,
          },
          refferenceId: {
               type: Schema.Types.ObjectId,
               required: true,
          },
          review_type: {
               type: String,
               required: true,
               enum: REVIEW_TYPES, // IMPORTANT: Defines the allowed models
          },
          images: {
               type: [String],
               default: [],
          },
          isDeleted: {
               type: Boolean,
               default: false,
          },
          isApproved: {
               type: Boolean,
               default: true,
          },
     },
     {
          timestamps: true,
          toJSON: {
               virtuals: true, // Ensures virtuals are included when converted to JSON
          },
     },
);

// Virtual for polymorphic population
reviewSchema.virtual('target', {
     ref: function () {
          return this.review_type; // Dynamically uses the value of the 'onModel' field
     },
     localField: 'refferenceId', // The field in this schema that contains the _id
     foreignField: '_id',         // The _id field in the referenced schema
     justOne: true,               // We expect only one document per refferenceId
});

// check user
// reviewSchema.post('save', async function () {
//      const review = this as IReview;

//      if (review.rating < 1 || review.rating > 5) {
//           throw new AppError(StatusCodes.BAD_REQUEST, 'Invalid rating value. Try give rating between 1 to 5');
//      }


//      // const isExistProduct = await Product.findById(review.refferenceId);
//      // if (!isExistProduct) {
//      //      throw new Error('Product not found');
//      // }

//      // const productAvgRating = Number(isExistProduct.avg_rating) + 1;

//      // let newRating;
//      // if (isExistProduct.avg_rating === null || isExistProduct.avg_rating === 0) {
//      //      newRating = review.rating;
//      // } else {
//      //      // Calculate the new rating based on previous ratings
//      //      newRating = (Number(isExistProduct.avg_rating) * Number(isExistProduct.totalReviews) + Number(review.rating)) / productAvgRating;
//      // }

//      // const updatedProduct = await Product.findByIdAndUpdate({ _id: review.refferenceId }, { avg_rating: parseFloat(newRating.toFixed(2)), totalReviews: productAvgRating }, { new: true });

//      // if (!updatedProduct) {
//      //      throw new AppError(StatusCodes.BAD_REQUEST, 'Failed to update product');
//      // }

//      const model = review.review_type === REVIEW_TYPES.PRODUCT ? Product : Business;
//      const isExistRefDoc = review.review_type === REVIEW_TYPES.PRODUCT
//           ? await Product.findById(review.refferenceId)
//           : await Business.findById(review.refferenceId);

//      if (!isExistRefDoc) {
//           throw new Error('Product not found');
//      }

//      const docTotalReviews = Number(isExistRefDoc.totalReviews) + 1;

//      let newRating;
//      if (isExistRefDoc.avg_rating === null || isExistRefDoc.avg_rating === 0) {
//           newRating = review.rating;
//      } else {
//           // Calculate the new rating based on previous ratings
//           newRating = (Number(isExistRefDoc.avg_rating) * Number(isExistRefDoc.totalReviews) + Number(review.rating)) / docTotalReviews;
//      }

//      if (newRating < 1 || newRating > 5) {
//           throw new AppError(StatusCodes.BAD_REQUEST, 'Invalid rating value. Try give rating between 1 to 5');
//      }

//      const updatedDoc = await model.findByIdAndUpdate({ _id: review.refferenceId }, { avg_rating: parseFloat(newRating.toFixed(2)), totalReviews: docTotalReviews, reviews: [...isExistRefDoc.reviews, this._id] }, { new: true });

//      if (!updatedDoc) {
//           throw new AppError(StatusCodes.BAD_REQUEST, 'Failed to update document');
//      }
// });

reviewSchema.pre('find', function (next) {
     this.find({ isDeleted: { $ne: true } });
     next();
});

reviewSchema.pre('findOne', function (next) {
     this.find({ isDeleted: { $ne: true } });
     next();
});

reviewSchema.pre('aggregate', function (next) {
     this.pipeline().unshift({ $match: { isDeleted: { $ne: true } } });
     next();
});


export const Review = model<IReview, ReviewModel>('Review', reviewSchema);
