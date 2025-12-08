import { Schema, model, Document } from 'mongoose';
import { IVariant } from './variant.interfaces'; // Import IVariant interface
import { VARIANT_OPTIONS } from './variant.enums';

// Define Mongoose Schema based on IVariant interface
const variantSchema = new Schema<IVariant & Document>(
     {
          categoryId: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
          subCategoryId: { type: Schema.Types.ObjectId, ref: 'SubCategory', required: true },
          createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
          slug: { type: String, required: true, unique: false, index: true },
          image: { type: [String], required: false },
          color: {
               name: { type: String, required: false },
               code: { type: String, required: false },
          },
          storage: { type: String, required: false },
          ram: { type: String, required: false },
          network_type: { type: [String], required: false },
          operating_system: { type: String, required: false },
          storage_type: { type: String, required: false },
          processor_type: { type: String, required: false },
          processor: { type: String, required: false },
          graphics_card_type: { type: String, required: false },
          graphics_card_size: { type: String, required: false },
          screen_size: { type: String, required: false },
          resolution: { type: String, required: false },
          lens_kit: { type: String, required: false },
          material: { type: String, required: false },
          size: { type: String, required: false },
          fabric: { type: String, required: false },
          shape: { type: String, required: false },
          flavour: { type: String, required: false },
          weight: { type: String, required: false },
          volume: { type: String, required: false },
          dimensions: { type: String, required: false },
          identifier: { type: String, required: false },
          capacity: { type: String, required: false },
          options: { type: String, enum: Object.values(VARIANT_OPTIONS) },
          description: { type: String, required: false },
          isDeleted: { type: Boolean, default: false },
          productRef: { type: Schema.Types.ObjectId, ref: 'Product', default: null },
          // expireAt: { type: Date, default: null },
          expireAt: { type: Date, default: null },
     },
     {
          timestamps: true,
     },
);
// This ensures that variants with productRef = null are deleted after 30 minutes
variantSchema.pre('save', function (next) {
     // If productRef is null, set expireAt to 30 minutes from now
     if (this.productRef && this.productRef.toString() !== 'null' && this.productRef.toString() !== 'undefined') {
          this.expireAt = null;
     } else {
          this.expireAt = new Date(Date.now() + 30 * 60 * 1000);
     }
     next();
});

// Set TTL index on expireAt field (MongoDB will auto-delete documents when the expireAt time is reached)
variantSchema.index({ expireAt: 1 }, { expireAfterSeconds: 0 });

// Query Middleware to exclude deleted users
variantSchema.pre('find', function (next) {
     this.find({ isDeleted: { $ne: true } });
     next();
});

variantSchema.pre('findOne', function (next) {
     this.find({ isDeleted: { $ne: true } });
     next();
});

variantSchema.pre('aggregate', function (next) {
     this.pipeline().unshift({ $match: { isDeleted: { $ne: true } } });
     next();
});
// Define the model with the interface and document type
const Variant = model<IVariant & Document>('Variant', variantSchema);

export default Variant;
