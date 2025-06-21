import { model, Schema } from "mongoose";
import { IShop } from "./shop.interface";
import { BUSINESS_TYPES } from "../business/business.enums";
import { IReview } from "../review/review.interface";


// mongoose schema for shop
export const shopSchema = new Schema<IShop>({
    name: { type: String, required: true, unique: true, trim: true, minlength: 3, maxlength: 100 },
    categories: [{ type: Schema.Types.ObjectId, ref: 'ShopCategory' }],
    type: { type: String, enum: BUSINESS_TYPES, required: false },
    phone: { type: String, required: true },
    email: { type: String, required: false, unique: true },
    description: { type: String, required: false },
    address: {
        province: { type: String, required: true },
        city: { type: String, required: true },
        territory: { type: String, required: true },
        country: { type: String },
        detail_address: { type: String }
    },
    location: { type: { type: String, enum: ['Point'], required: true }, coordinates: { type: [Number], required: false } },
    service: { type: String, required: false },
    working_hours: { type: [Object], required: false },
    logo: { type: String, required: false },
    cover_photo: { type: String, required: false },
    promot_banner: { type: String, required: false },
    reviews: [{ type: Schema.Types.ObjectId, ref: 'Review' }],
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    admins: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    followers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    coupons: [{ type: Schema.Types.ObjectId, ref: 'Coupon' }],
    chats: [{ type: Schema.Types.ObjectId, ref: 'Chat' }],
    orders: [{ type: Schema.Types.ObjectId, ref: 'Order' }],
    website: { type: String },
    isDeleted: { type: Boolean, default: false },
    isVerified: { type: Boolean, default: false },
    rating: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },
    totalFollowers: { type: Number, default: 0 },
    settings: {
        allowChat: { type: Boolean, default: true },
        autoAcceptOrders: { type: Boolean, default: false },
        businessHours: { type: [Object], required: true }
    },
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });


// Middleware to calculate totalReviews and rating based on reviews
shopSchema.pre('save', async function (next) {
    if (this.isModified('reviews')) {
        // Populate the reviews with the actual Review data
        const populatedReviews = await mongoose.model('Review').find({ '_id': { $in: this.reviews } }).exec();

        // Calculate the total number of reviews
        this.totalReviews = populatedReviews.length;

        // Calculate the average rating based on the reviews
        const totalRating = populatedReviews.reduce((acc: number, review: IReview) => acc + review.rating, 0);
        this.rating = this.totalReviews > 0 ? totalRating / this.totalReviews : 0;
    }
    next();
});


// Middleware to calculate totalFollowers and rating based on followers
shopSchema.pre('save', async function (next) {
    if (this.isModified('followers')) {
        // Populate the followers with the actual User data
        const populatedFollowers = await mongoose.model('User').find({ '_id': { $in: this.followers } }).exec();

        // Calculate the total number of followers
        this.totalFollowers = populatedFollowers.length > 0 ? populatedFollowers.length : 0;
    }
    next();
});


// Query Middleware to exclude deleted users
shopSchema.pre('find', function (next) {
    this.find({ isDeleted: { $ne: true } });
    next();
});

shopSchema.pre('findOne', function (next) {
    this.find({ isDeleted: { $ne: true } });
    next();
});

shopSchema.pre('aggregate', function (next) {
    this.pipeline().unshift({ $match: { isDeleted: { $ne: true } } });
    next();
});


export const Shop = model<IShop>("Shop", shopSchema);
