import { Schema, model } from 'mongoose';
import { IPackage } from './package.interface';
import { PackageName, PackageAllowedProductsCount, PackageCommission, PackageDuration } from './package.enum';
import { USER_ROLES } from '../user/user.enums';

const packageSchema = new Schema<IPackage>(
  {
    name: { type: String, enum: PackageName, required: true },
    isForRole: { type: String, enum: [USER_ROLES.VENDOR], required: true },
    duration: { type: String, enum: PackageDuration, required: true, default: PackageDuration.MONTHLY },
    price: { type: Number, required: true },
    features: {
      allowedProducts: {
        type: Number,
        enum: PackageAllowedProductsCount,
        required: false,
      },
      isAllowedUnlimitedProducts: { type: Boolean, required: false },
      commisionPercentage: {
        type: Number,
        enum: PackageCommission,
        required: true,
      },
      isIncludedBlackFriday: { type: Boolean, required: false },
      isIncludedPromos: { type: Boolean, required: false },
      isIncludedRoadshow: { type: Boolean, required: false },
    },
    stripeProductId: { type: String, required: true },
    priceId: { type: String, required: true },
    url: { type: String, required: true },
  },
  { timestamps: true }
);

export const Package = model<IPackage>('Package', packageSchema);
