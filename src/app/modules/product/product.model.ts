import mongoose, { model, Schema, Model } from 'mongoose';
import { IProduct, IProductSingleVariant } from './product.interface';
import { IReview } from '../review/review.interface';
import { Offered } from '../offered/offered.model';
import { chitChatShipment_package_type, chitChatShipment_size_unit, chitChatShipment_weight_unit } from '../third-party-modules/chitChatShipment/chitChatShipment.enum';

const productVariantSchema = new Schema<IProductSingleVariant>(
     {
          variantId: {
               type: Schema.Types.ObjectId,
               ref: 'Variant',
               required: true,
               unique: true,
          },
          variantQuantity: {
               type: Number,
               required: true,
               min: 0,
          },
          variantPrice: {
               type: Number,
               required: true,
               min: 0,
          },
          slug: {
               type: String,
               required: false,
          },
     },
     {
          _id: false,
     },
);

const productSchema = new Schema<IProduct>(
     {
          name: {
               type: String,
               required: true,
               trim: true,
               minlength: 2,
               maxlength: 100,
          },
          territory: {
               type: String,
          },
          city: {
               type: String,
          },
          province: {
               type: String,
          },
          description: {
               type: String,
               required: true,
               trim: true,
               minlength: 10,
          },
          basePrice: {
               type: Number,
               required: true,
               min: 0,
          },
          totalStock: {
               type: Number,
               required: true,
               min: 0,
          },
          images: [
               {
                    type: String,
                    required: true,
               },
          ],
          isFeatured: {
               type: Boolean,
               default: false,
          },
          weight: {
               type: Number,
               required: true,
               min: 0,
          },
          tags: [
               {
                    type: String,
                    trim: true,
                    required: true,
               },
          ],
          avg_rating: {
               type: Number,
               default: 0,
               min: 0,
               max: 5,
          },
          purchaseCount: {
               type: Number,
               default: 0,
               min: 0,
          },
          viewCount: {
               type: Number,
               default: 0,
               min: 0,
          },
          categoryId: {
               type: Schema.Types.ObjectId,
               ref: 'Category',
               required: true,
          },
          subcategoryId: {
               type: Schema.Types.ObjectId,
               ref: 'SubCategory',
               required: true,
          },
          shopId: {
               type: Schema.Types.ObjectId,
               ref: 'Shop',
               required: true,
          },
          brandId: {
               type: Schema.Types.ObjectId,
               ref: 'Brand',
               required: true,
          },
          brandName: {
               type: String,
               required: false,
          },
          createdBy: {
               type: Schema.Types.ObjectId,
               ref: 'User',
               required: true,
          },
          reviews: [
               {
                    type: Schema.Types.ObjectId,
                    ref: 'Review',
               },
          ],
          totalReviews: {
               type: Number,
               default: 0,
               min: 0,
          },
          product_variant_Details: [productVariantSchema],
          isDeleted: {
               type: Boolean,
               default: false,
          },
          deletedAt: {
               type: Date,
               default: null,
          },
          isRecommended: {
               type: Boolean,
               default: false,
          },

          slugDetails: {
               type: Map,
               of: [String], // An array of strings for each dynamic field
               default: {},
          },
          package_type: {
               type: String,
               enum: Object.values(chitChatShipment_package_type),
               default: chitChatShipment_package_type.parcel,
          },
          weight_unit: {
               type: String,
               enum: Object.values(chitChatShipment_weight_unit),
               default: chitChatShipment_weight_unit.gram,
          },
          size_unit: {
               type: String,
               enum: Object.values(chitChatShipment_size_unit),
               default: chitChatShipment_size_unit.centimeter,
          },
          size_x: {
               type: Number,
          },
          size_y: {
               type: Number,
          },
          size_z: {
               type: Number,
          },

          manufacturer_contact: {
               type: String,
          },
          manufacturer_street: {
               type: String,
          },
          manufacturer_city: {
               type: String,
          },
          manufacturer_postal_code: {
               type: String,
          },
          manufacturer_province_code: {
               type: String,
          },
     },
     {
          timestamps: true,
          toJSON: {
               virtuals: true,
          },
          toObject: {
               virtuals: true,
          },
     },
);

// Indexes
productSchema.index({ name: 'text', description: 'text', tags: 'text' });
productSchema.index({ categoryId: 1 });
productSchema.index({ subcategoryId: 1 });
productSchema.index({ shopId: 1 });
productSchema.index({ isFeatured: 1 });
productSchema.index({ avg_rating: -1 });

// Virtuals
productSchema.virtual('variants', {
     ref: 'Variant',
     localField: 'product_variant_Details.variantId',
     foreignField: '_id',
     justOne: false,
});

// Pre-save middleware to update totalStock
productSchema.pre<IProduct>('save', function (next) {
     if (this.isModified('product_variant_Details')) {
          const totalStock = this.product_variant_Details.reduce((sum: number, variant: IProductSingleVariant) => sum + variant.variantQuantity, 0);
          this.totalStock = totalStock;
     }
     next();
});

// Pre-save middleware to update avg_rating
productSchema.pre<IProduct>('save', async function (next) {
     const populatedReviews = await mongoose
          .model('Review')
          // .find({ _id: { $in: this.reviews } })
          .find({ refferenceId: this._id })
          .exec();
     if (populatedReviews.length > 0) {
          this.totalReviews = populatedReviews.length;
          const totalRating = populatedReviews.reduce((acc: number, review: IReview) => acc + review.rating, 0);
          const avg_rating = totalRating / this.totalReviews;
          this.avg_rating = avg_rating;
     }
     next();
});

productSchema.pre('find', function (next) {
     this.find({ isDeleted: { $ne: true } });
     next();
});

productSchema.pre('findOne', function (next) {
     this.find({ isDeleted: { $ne: true } });
     next();
});

productSchema.pre('aggregate', function (next) {
     this.pipeline().unshift({ $match: { isDeleted: { $ne: true } } });
     next();
});

productSchema.methods.calculateOfferPrice = async function () {
     const offer = await Offered.findOne({ product: this._id });

     if (offer) {
          const discount = (offer.discountPercentage / 100) * this.basePrice;
          return this.basePrice - discount;
     }

     return 0;
};

export const Product = model<IProduct>('Product', productSchema) as unknown as Model<IProduct> & {
     findById(id: string): Promise<IProduct | null>;
};
