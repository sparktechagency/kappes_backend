import mongoose, { model } from "mongoose";
import { IBusiness } from "./business.interface";
import { BUSINESS_TYPES } from "./business.enums";

const Schema = mongoose.Schema;



// 2. Define the main schema for your entity (e.g., Store, Business)
const BusinessSchema = new Schema({
    name: { type: String, required: true, trim: true },
    type: { type: String, enum: Object.values(BUSINESS_TYPES), required: true },
    email: { type: String, required: true, trim: true, unique: true },
    phone: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    address: {
        province: { type: String },
        city: { type: String },
        territory: { type: String },
        country: { type: String },
        detail_address: { type: String },
    },
    service: { type: String, required: false },
    working_hours: { type: [{ day: String, start: String, end: String }, { _id: false }], required: false },
    logo: { type: String, required: false },
    coverPhoto: { type: String, required: false },
    banner: { type: [String], required: false },
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    reviews: [{ type: Schema.Types.ObjectId, ref: 'Review' }],
    totalReviews: { type: Number, default: 0, min: 0 },
    avg_rating: { type: Number, default: 0, min: 0, max: 5 },
    isDeleted: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    verified: {
        type: Boolean,
        default: false,
    },
    authentication: {
        type: {
            oneTimeCode: {
                type: Number,
                default: null,
            },
            expireAt: {
                type: Date,
                default: null,
            },
        },
        select: false,
    },
    messages: [{
        senderName: { type: String, required: true },
        senderEmail: { type: String, required: true },
        message: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
    }],
});

// handle delted in finding or aggreating also findOne
BusinessSchema.pre('find', function () {
    this.where({ isDeleted: false });
});
BusinessSchema.pre('aggregate', function () {
    this.pipeline().unshift({ $match: { isDeleted: false } });
}); 
BusinessSchema.pre('findOne', function () {
    this.where({ isDeleted: false });
}); 

export const Business = model<IBusiness>("Business", BusinessSchema);