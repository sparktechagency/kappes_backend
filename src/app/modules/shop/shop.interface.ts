import mongoose, { model, Schema } from "mongoose";
import { IBusiness, IBusinessHours, IGeoLocation } from "../business/business.interface";
import { BUSINESS_TYPES } from "../business/business.enums";
import { IReview } from "../review/review.interface";

export interface IShop extends Partial<IBusiness> {
    // check IBusiness
    name: string;
    type?: BUSINESS_TYPES;
    email: string;
    phone: string;
    description: string;
    address?: {
        province: string;
        city: string;
        territory: string;
        country?: string;
        detail_address?: string;
    };
    location: IGeoLocation;
    service: string;
    working_hours: IBusinessHours;
    logo: string;
    cover_photo: string;
    promot_banner: string;
    reviews: Schema.Types.ObjectId[];
    owner: mongoose.Types.ObjectId;
    // ..
    admins?: mongoose.Types.ObjectId[];
    followers?: mongoose.Types.ObjectId[];
    coupons?: mongoose.Types.ObjectId[];
    // ...
    website?: string;
    categories?: mongoose.Types.ObjectId[];
    chats?: mongoose.Types.ObjectId[];
    orders?: mongoose.Types.ObjectId[];
    isActive: boolean;
    isDeleted: boolean;
    isVerified: boolean;
    rating: number;
    totalReviews: number;
    totalFollowers: number;
    settings: {
        allowChat: boolean;
        autoAcceptOrders: boolean;
        businessHours: IBusinessHours[];
    };
    createdAt: Date;
    updatedAt: Date;
}
