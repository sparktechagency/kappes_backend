import { Model, Types } from 'mongoose';
import { IBusiness } from '../business/business.interface';
import { REVIEW_TYPES } from './review.enums';
import { IProduct } from '../../product/product.interface';

export type IReview = {
     customer: Types.ObjectId;
     rating: number;
     comment: string;
     refferenceId: Types.ObjectId; // either product or business
     review_type: REVIEW_TYPES; // New field: Specifies which model refferenceId points to
     target?: IProduct | IBusiness; // When populated, this will hold the actual product or business object
};

export type ReviewModel = Model<IReview>;
