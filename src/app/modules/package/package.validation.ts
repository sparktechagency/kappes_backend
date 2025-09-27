import { z } from 'zod';
import { PackageName, PackageAllowedProductsCount, PackageCommission, PackageBlackFriday, PackagePromos, PackageRoadshow, PackageDuration } from './package.enum';
import { USER_ROLES } from '../user/user.enums';

const createPackageZodSchema = z.object({
     body: z
          .object({
               name: z.nativeEnum(PackageName, {
                    required_error: 'name is required',
                    invalid_type_error: 'name should be a valid package name (STARTER, GROWTH, or PREMIUM)',
               }),
               isForRole: z.enum([USER_ROLES.VENDOR], {
                    required_error: 'role is required',
                    invalid_type_error: 'role should be VENDOR',
               }),
               duration: z.nativeEnum(PackageDuration, {
                    required_error: 'duration is required',
                    invalid_type_error: 'duration should be a valid package duration (MONTHLY, QUARTERLY, HALF_YEARLY, or YEARLY)',
               }),
               price: z.number({
                    required_error: 'price is required',
                    invalid_type_error: 'price should be a number',
               }),
               features: z.object({
                    allowedProducts: z
                         .union([z.literal(PackageAllowedProductsCount.STARTER), z.literal(PackageAllowedProductsCount.GROWTH), z.literal(PackageAllowedProductsCount.PREMIUM)])
                         .optional(),
                    commisionPercentage: z.union([z.literal(PackageCommission.STARTER), z.literal(PackageCommission.GROWTH), z.literal(PackageCommission.PREMIUM)]),
                    isIncludedBlackFriday: z.boolean().optional(),
                    isIncludedPromos: z.boolean().optional(),
                    isIncludedRoadshow: z.boolean().optional(),
               }),
               stripeProductId: z.string({
                    required_error: 'stripeProductId is required',
                    invalid_type_error: 'stripeProductId should be a string',
               }),
               priceId: z.string({
                    required_error: 'priceId is required',
                    invalid_type_error: 'priceId should be a string',
               }),
               url: z.string({
                    required_error: 'url is required',
                    invalid_type_error: 'url should be a string',
               }),
          })
          .superRefine((body, ctx) => {
               const { name, features } = body as any;
               if (!features) return;

               const expectedAllowed = PackageAllowedProductsCount[name as PackageName];
               const expectedCommission = PackageCommission[name as PackageName];
               const expectedBlackFriday = PackageBlackFriday[name as PackageName];
               const expectedPromos = PackagePromos[name as PackageName];
               const expectedRoadshow = PackageRoadshow[name as PackageName];

               if (features.allowedProducts !== undefined && features.allowedProducts !== expectedAllowed) {
                    ctx.addIssue({
                         code: z.ZodIssueCode.custom,
                         message: 'allowedProducts must match the package type',
                         path: ['features', 'allowedProducts'],
                    });
               }

               if (features.commisionPercentage !== undefined && features.commisionPercentage !== expectedCommission) {
                    ctx.addIssue({
                         code: z.ZodIssueCode.custom,
                         message: 'commisionPercentage must match the package type',
                         path: ['features', 'commisionPercentage'],
                    });
               }

               if (features.isIncludedBlackFriday !== undefined && features.isIncludedBlackFriday !== expectedBlackFriday) {
                    ctx.addIssue({
                         code: z.ZodIssueCode.custom,
                         message: 'isIncludedBlackFriday can only be true for PREMIUM',
                         path: ['features', 'isIncludedBlackFriday'],
                    });
               }

               if (features.isIncludedPromos !== undefined && features.isIncludedPromos !== expectedPromos) {
                    ctx.addIssue({
                         code: z.ZodIssueCode.custom,
                         message: 'isIncludedPromos can only be false for STARTER',
                         path: ['features', 'isIncludedPromos'],
                    });
               }

               if (features.isIncludedRoadshow !== undefined && features.isIncludedRoadshow !== expectedRoadshow) {
                    ctx.addIssue({
                         code: z.ZodIssueCode.custom,
                         message: 'isIncludedRoadshow can only be true for PREMIUM',
                         path: ['features', 'isIncludedRoadshow'],
                    });
               }
          }),
});

const updatePackageZodSchema = z.object({
     body: z
          .object({
               name: z
                    .enum([PackageName.STARTER, PackageName.GROWTH, PackageName.PREMIUM], {
                         invalid_type_error: 'name should be a valid package name',
                    })
                    .optional(),
               isForRole: z
                    .enum([USER_ROLES.VENDOR], {
                         invalid_type_error: 'role should be VENDOR',
                    })
                    .optional(),
               duration: z
                    .nativeEnum(PackageDuration, {
                         invalid_type_error: 'duration should be a valid package duration',
                    })
                    .optional(),
               price: z
                    .number({
                         invalid_type_error: 'price should be a number',
                    })
                    .optional(),
               features: z
                    .object({
                         allowedProducts: z
                              .union([z.literal(PackageAllowedProductsCount.STARTER), z.literal(PackageAllowedProductsCount.GROWTH), z.literal(PackageAllowedProductsCount.PREMIUM)])
                              .optional(),
                         commisionPercentage: z.union([z.literal(PackageCommission.STARTER), z.literal(PackageCommission.GROWTH), z.literal(PackageCommission.PREMIUM)]).optional(),
                         isIncludedBlackFriday: z.boolean().optional(),
                         isIncludedPromos: z.boolean().optional(),
                         isIncludedRoadshow: z.boolean().optional(),
                    })
                    .optional(),
               stripeProductId: z
                    .string({
                         invalid_type_error: 'stripeProductId should be a string',
                    })
                    .optional(),
               priceId: z
                    .string({
                         invalid_type_error: 'priceId should be a string',
                    })
                    .optional(),
               url: z
                    .string({
                         invalid_type_error: 'url should be a string',
                    })
                    .optional(),
          })
          .superRefine((body, ctx) => {
               const { name, features } = body as any;
               // Only run consistency checks when both are present in the update payload
               if (!name || !features) return;

               const expectedAllowed = PackageAllowedProductsCount[name as PackageName];
               const expectedCommission = PackageCommission[name as PackageName];
               const expectedBlackFriday = PackageBlackFriday[name as PackageName];
               const expectedPromos = PackagePromos[name as PackageName];
               const expectedRoadshow = PackageRoadshow[name as PackageName];

               if (features.allowedProducts !== undefined && features.allowedProducts !== expectedAllowed) {
                    ctx.addIssue({
                         code: z.ZodIssueCode.custom,
                         message: 'allowedProducts must match the package type',
                         path: ['features', 'allowedProducts'],
                    });
               }

               if (features.commisionPercentage !== undefined && features.commisionPercentage !== expectedCommission) {
                    ctx.addIssue({
                         code: z.ZodIssueCode.custom,
                         message: 'commisionPercentage must match the package type',
                         path: ['features', 'commisionPercentage'],
                    });
               }

               if (features.isIncludedBlackFriday !== undefined && features.isIncludedBlackFriday !== expectedBlackFriday) {
                    ctx.addIssue({
                         code: z.ZodIssueCode.custom,
                         message: 'isIncludedBlackFriday can only be true for PREMIUM',
                         path: ['features', 'isIncludedBlackFriday'],
                    });
               }

               if (features.isIncludedPromos !== undefined && features.isIncludedPromos !== expectedPromos) {
                    ctx.addIssue({
                         code: z.ZodIssueCode.custom,
                         message: 'isIncludedPromos can only be false for STARTER',
                         path: ['features', 'isIncludedPromos'],
                    });
               }

               if (features.isIncludedRoadshow !== undefined && features.isIncludedRoadshow !== expectedRoadshow) {
                    ctx.addIssue({
                         code: z.ZodIssueCode.custom,
                         message: 'isIncludedRoadshow can only be true for PREMIUM',
                         path: ['features', 'isIncludedRoadshow'],
                    });
               }
          }),
});

export const PackageValidation = {
     createPackageZodSchema,
     updatePackageZodSchema,
};
