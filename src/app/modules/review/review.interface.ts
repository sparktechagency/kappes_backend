import { Model, Types } from 'mongoose';
import { IBusiness } from '../business/business.interface';
import { REVIEW_TYPES } from './review.enums';
import { IProduct } from '../product/product.interface';

export interface IReviewBase {
     customer: Types.ObjectId;
     rating: number;
     comment: string;
     review_type: REVIEW_TYPES;
     isDeleted?: boolean;
     isApproved?: boolean;
}

export interface IReview extends IReviewBase {
     refferenceId: Types.ObjectId; // Unpopulated reference
     target?: IProduct | IBusiness; // Populated reference
}

export interface IPopulatedReview extends IReviewBase {
     refferenceId: IProduct | IBusiness; // Populated reference
     target?: IProduct | IBusiness;
}

export type ReviewModel = Model<IReview>;
