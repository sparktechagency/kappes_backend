import { model, Schema } from 'mongoose';
import { ISubCategory } from './subCategory.interface';

// sub category
const subCategorySchema = new Schema<ISubCategory>(
     {
          name: { type: String, required: true },
          thumbnail: { type: String, required: true },
          description: { type: String, default: '' },
          categoryId: {
               type: Schema.Types.ObjectId,
               ref: 'Category',
               required: true,
          },
          createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
          variants: [{
               type: Schema.Types.ObjectId,
               ref: 'Variant',
               required: true,
          }],
          status: {
               type: String,
               enum: ['active', 'inactive'],
               default: 'active',
          },
          isDeleted: { type: Boolean, default: false },
     },
     {
          timestamps: true,
     },
);
// Query Middleware to exclude deleted users
subCategorySchema.pre('find', function (next) {
     this.find({ isDeleted: { $ne: true } });
     next();
});

subCategorySchema.pre('findOne', function (next) {
     this.find({ isDeleted: { $ne: true } });
     next();
});

subCategorySchema.pre('aggregate', function (next) {
     this.pipeline().unshift({ $match: { isDeleted: { $ne: true } } });
     next();
});

export const SubCategory = model<ISubCategory>('SubCategory', subCategorySchema);
