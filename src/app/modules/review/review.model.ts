import { model, Schema } from 'mongoose';
import { IReview, ReviewModel } from './review.interface';
import { StatusCodes } from 'http-status-codes';
import AppError from '../../../errors/AppError';

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
               enum: ['Product', 'Business'], // IMPORTANT: Defines the allowed models
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

//check user
// reviewSchema.post('save', async function () {
//      const review = this as IReview;

//      if (review.rating < 1 || review.rating > 5) {
//           throw new AppError(StatusCodes.BAD_REQUEST, 'Invalid rating value. Try give rating between 1 to 5');
//      }

//      const isExistService = await Service.findById(review.service);
//      if (!isExistService) {
//           throw new Error('Service not found');
//      }

//      const ratingCount = Number(isExistService.totalRating) + 1;

//      let newRating;
//      if (isExistService.rating === null || isExistService.rating === 0) {
//           newRating = review.rating;
//      } else {
//           // Calculate the new rating based on previous ratings
//           newRating = (Number(isExistService.rating) * Number(isExistService.totalRating) + Number(review.rating)) / ratingCount;
//      }

//      const updatedService = await Service.findByIdAndUpdate({ _id: review.service }, { rating: parseFloat(newRating.toFixed(2)), totalRating: ratingCount }, { new: true });

//      if (!updatedService) {
//           throw new AppError(StatusCodes.BAD_REQUEST, 'Failed to update service');
//      }
// });

export const Review = model<IReview, ReviewModel>('Review', reviewSchema);
