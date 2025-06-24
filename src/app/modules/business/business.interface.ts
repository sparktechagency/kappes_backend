import mongoose, { Schema } from "mongoose";
import { BUSINESS_TYPES } from "./business.enums";

interface ITimeSlot {
    start: string; // e.g., "09:00"
    end: string;   // e.g., "17:00"
}

export interface IBusinessHours {
    monday: ITimeSlot[];
    tuesday: ITimeSlot[];
    wednesday: ITimeSlot[];
    thursday: ITimeSlot[];
    friday: ITimeSlot[];
    saturday: ITimeSlot[];
    sunday: ITimeSlot[];
}

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

export interface IBusiness {
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
    location: IGeoLocation;
    service: string;
    working_hours: {
        day: string;
        start: string;
        end: string;
    }[];
    logo: string;
    coverPhoto: string;
    banner: string;
    reviews: Schema.Types.ObjectId[];
    owner: mongoose.Types.ObjectId;
    isDeleted: boolean;
    isActive: boolean;
    isVerified: boolean;
}


