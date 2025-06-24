import { model, Schema, Document, Types, Model } from "mongoose";
import { IProduct, IProductSingleVariant } from "./product.interface";
import { IReview } from "../review/review.interface";
import { Offered } from "../offered/offered.model";

const productVariantSchema = new Schema<IProductSingleVariant>({
  variantId: {
    type: Schema.Types.ObjectId,
    ref: 'Variant',
    required: true
  },
  variantQuantity: {
    type: Number,
    required: true,
    min: 0
  },
  variantPrice: {
    type: Number,
    required: true,
    min: 0
  }
},
  {
    _id: false
  }
);

const productSchema = new Schema<IProduct>({
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 100
  },
  description: {
    type: String,
    required: true,
    trim: true,
    minlength: 10
  },
  basePrice: {
    type: Number,
    required: true,
    min: 0
  },
  totalStock: {
    type: Number,
    required: true,
    min: 0
  },
  images: [{
    type: String,
    required: true,
  }],
  isFeatured: {
    type: Boolean,
    default: false
  },
  weight: {
    type: Number,
    min: 0
  },
  tags: [{
    type: String,
    trim: true,
    required: true
  }],
  avg_rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  purchaseCount: {
    type: Number,
    default: 0,
    min: 0
  },
  viewCount: {
    type: Number,
    default: 0,
    min: 0
  },
  categoryId: {
    type: Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  subcategoryId: {
    type: Schema.Types.ObjectId,
    ref: 'SubCategory',
    required: true
  },
  shopId: {
    type: Schema.Types.ObjectId,
    ref: 'Shop',
    required: true
  },
  brandId: {
    type: Schema.Types.ObjectId,
    ref: 'Brand',
    required: true
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reviews: [{
    type: Schema.Types.ObjectId,
    ref: 'Review'
  }],
  totalReviews: {
    type: Number,
    default: 0,
    min: 0
  },
  product_variant_Details: [productVariantSchema],
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: {
    type: Date,
    default: null
  },
  isRecommended: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  toJSON: {
    virtuals: true
  },
  toObject: {
    virtuals: true
  }
});

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
  justOne: false
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
  if (this.isModified('reviews')) {
    this.avg_rating = 0;
    const populatedReviews = await mongoose.model('Review').find({ '_id': { $in: this.reviews } }).exec();
    const totalRating = populatedReviews.reduce((acc: number, review: IReview) => acc + review.rating, 0);
    this.avg_rating = this.totalReviews > 0 ? totalRating / this.totalReviews : 0;
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
