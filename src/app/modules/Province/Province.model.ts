import { Schema, model } from 'mongoose';
import { IProvince } from './Province.interface';

const ProvinceSchema = new Schema<IProvince>(
     {
          image: { type: [String], required: true },
          title: { type: String, required: true },
          description: { type: String, required: true },
          isDeleted: { type: Boolean, default: false },
          deletedAt: { type: Date },
     },
     { timestamps: true },
);

ProvinceSchema.pre('find', function (next) {
     this.find({ isDeleted: false });
     next();
});

ProvinceSchema.pre('findOne', function (next) {
     this.findOne({ isDeleted: false });
     next();
});

ProvinceSchema.pre('aggregate', function (next) {
     this.pipeline().unshift({ $match: { isDeleted: { $ne: true } } });
     next();
});

export const Province = model<IProvince>('Province', ProvinceSchema);
