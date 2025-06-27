import mongoose, { model } from "mongoose";
import { IBusiness } from "./business.interface";

const Schema = mongoose.Schema;

const TimeSlotSchema = new Schema({
    start: {
        type: String, // Storing as "HH:MM" string, e.g., "09:00", "13:30"
        required: true,
        // Optional: Add a regex validator for HH:MM format
        match: /^([01]\d|2[0-3]):([0-5]\d)$/
    },
    end: {
        type: String, // Storing as "HH:MM" string, e.g., "17:00", "22:00"
        required: true,
        // Optional: Add a regex validator for HH:MM format
        match: /^([01]\d|2[0-3]):([0-5]\d)$/
    }
}, { _id: false }); // Set _id to false if you don't need Mongoose to create

// 2. Define the main schema for your entity (e.g., Store, Business)
const BusinessSchema = new Schema({

    // ... other fields for your business


    b_location: {
        type: { type: String, enum: ['Point'], required: true },
        coordinates: { type: [Number], required: true, index: '2dsphere' }, // [longitude, latitude]
    },
    working_hours: { type: [{ day: String, start: String, end: String }, { _id: false }], required: false },
    reviews: [{
        type: Schema.Types.ObjectId,
        ref: 'Review'
    }],
    totalReviews: {
        type: Number,
        default: 0,
        min: 0
    },
    avg_rating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    },
    isDeleted: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    isVerified: { type: Boolean, default: false },
});

export const Business = model<IBusiness>("Business", BusinessSchema);