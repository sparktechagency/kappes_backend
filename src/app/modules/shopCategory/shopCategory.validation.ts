import { z } from 'zod';

const createShopCategoryValidationSchema = z.object({
  body: z.object({
    name: z
      .string()
      .nonempty("shop Category name is required")
      .max(100, "shop Category name should not exceed 100 characters"),
  }),
});


const updateShopCategoryValidationSchema = z.object({
  body: z.object({
    name: z
      .string()
      .max(100, "shop Category name should not exceed 100 characters")
      .optional(),
    createdBy: z.string().optional(),
    isActive: z.boolean().optional()
  })
});

export const shopCategoryValidation = {
  createShopCategoryValidationSchema,
  updateShopCategoryValidationSchema
}