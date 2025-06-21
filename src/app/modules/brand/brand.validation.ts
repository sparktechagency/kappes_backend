import { z } from 'zod';

const createBrandValidationSchema = z.object({
  body: z.object({
    name: z
      .string()
      .nonempty("Brand name is required")
      .max(100, "Brand name should not exceed 100 characters"),
  }),
});


const updateBrandValidationSchema = z.object({
  body: z.object({
    name: z
      .string()
      .max(100, "Brand name should not exceed 100 characters")
      .optional(),
    createdBy: z.string().optional(),
    isActive: z.boolean().optional()
  })
});

export const brandValidation = {
  createBrandValidationSchema,
  updateBrandValidationSchema
}