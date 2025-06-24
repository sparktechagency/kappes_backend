import mongoose, { model, Schema } from "mongoose";
import { IGeoLocation } from "../business/business.interface";
import { BUSINESS_TYPES } from "../business/business.enums";

export interface IShop {
    name: string;
    email: string;
    phone: string;
    categories: mongoose.Types.ObjectId[];
    owner: mongoose.Types.ObjectId;
    isActive: boolean;
    isDeleted: boolean;
    createdAt: Date;
    updatedAt: Date;
    type?: BUSINESS_TYPES;
    description?: string;
    address?: {
        province: string;
        city: string;
        territory: string;
        country?: string;
        detail_address?: string;
    };
    location?: IGeoLocation;
    service?: string;
    working_hours?: { day: string; start: string; end: string }[];
    logo?: string;
    coverPhoto?: string;
    banner?: string;
    reviews?: Schema.Types.ObjectId[];
    // ..
    admins?: mongoose.Types.ObjectId[];
    followers?: mongoose.Types.ObjectId[];
    coupons?: mongoose.Types.ObjectId[];
    // ...
    website?: string;
    chats?: mongoose.Types.ObjectId[];
    orders?: mongoose.Types.ObjectId[];
    rating: number;
    totalReviews: number;
    totalFollowers?: number;
    revenue: number;
    settings?: {
        allowChat: boolean;
        autoAcceptOrders: boolean;
    };
}
