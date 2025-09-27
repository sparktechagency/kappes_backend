import { Model } from 'mongoose';
import { PackageName, PackageAllowedProductsCount, PackageCommission } from './package.enum';
import { USER_ROLES } from '../user/user.enums';
import { PackageDuration } from './package.enum';

export type IPackage = {
     name: PackageName;
     isForRole: USER_ROLES.VENDOR;
     duration: PackageDuration;
     price: number;
     features: {
          allowedProducts?:
               | PackageAllowedProductsCount.STARTER
               | PackageAllowedProductsCount.GROWTH
               | PackageAllowedProductsCount.PREMIUM; // 20 for "STARTER", 100 for "GROWTH", 1000000 for "PREMIUM" packages
          isAllowedUnlimitedProducts?: boolean;
          commisionPercentage:
               | PackageCommission.STARTER
               | PackageCommission.GROWTH
               | PackageCommission.PREMIUM; // 8 for "STARTER", 3 for "GROWTH", 0 for "PREMIUM"
          isIncludedBlackFriday: boolean; // only true for "PREMIUM"
          isIncludedPromos: boolean; // only false for "STARTER"
          isIncludedRoadshow: boolean; // only true for "PREMIUM"
     };
     stripeProductId: string;
     priceId: string;
     url: string;
};

export type PackageModel = Model<IPackage>;
