import mongoose, { Document } from "mongoose";
import { BUSINESS_TYPES } from "./business.enums";



export interface IGeoLocation {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
}

export interface IBusinessSearchParams {
    latitude?: number;
    longitude?: number;
    radius?: number;
    searchByLocationText?: string;
}

export interface IBusiness extends Document {
    _id: mongoose.Types.ObjectId;
    name: string;
    type: BUSINESS_TYPES;
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
    service: string;
    working_hours?: { day: string; start: string; end: string }[];
    logo: string;
    coverPhoto: string;
    banner: string[];
    owner: mongoose.Types.ObjectId;
    reviews: mongoose.Types.ObjectId[];
    totalReviews: number;
    avg_rating: number;
    isDeleted: boolean;
    isActive: boolean;
    verified: boolean;
    authentication?: {
        oneTimeCode: number;
        expireAt: Date;
    };
    messages : {
        senderName:string;
        senderEmail:string;
        message:string;
        createdAt:Date;
    }[]
}


