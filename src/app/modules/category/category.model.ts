import { model, Schema } from 'mongoose';
import { ICategory } from './category.interface';

const categorySchema = new Schema<ICategory>(
     {
          name: { type: String, required: true, unique: true },
          thumbnail: { type: String, required: true },
          createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
          subCategory: {
               type: [Schema.Types.ObjectId],
               ref: 'SubCategory',
               default: [],
          },
          description: { type: String, required: true },
          status: { type: String, enum: ['active', 'inactive'], default: 'active' },
          isDeleted: { type: Boolean, default: false },
          ctgViewCount: { type: Number, default: 0 },
     },
     { timestamps: true },
);
// Query Middleware to exclude deleted users
categorySchema.pre('find', function (next) {
     this.find({ isDeleted: { $ne: true } });
     next();
});

categorySchema.pre('findOne', function (next) {
     this.find({ isDeleted: { $ne: true } });
     next();
});

categorySchema.pre('aggregate', function (next) {
     this.pipeline().unshift({ $match: { isDeleted: { $ne: true } } });
     next();
});
export const Category = model<ICategory>('Category', categorySchema);
