import { z } from 'zod';
import { objectIdSchema } from '../variant/variant.validation';

const createCategoryZodSchema = z.object({
     body: z.object({
          name: z.string({ required_error: 'Category name is required' }),
          description: z.string({ required_error: 'Category name is required' }),
     }),
});

const updateCategoryZodSchema = z.object({
     body: z.object({
          name: z.string().optional(),
          description: z.string({ required_error: 'Category name is required' }),
     }),
});
const updateCategoryStatusZodSchema = z.object({
     body: z.object({
          status: z.enum(['active', 'inactive']),
     }),
});

export const CategoryValidation = {
     createCategoryZodSchema,
     updateCategoryZodSchema,
     updateCategoryStatusZodSchema,
};
