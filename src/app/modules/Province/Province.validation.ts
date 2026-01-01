import { z } from 'zod';

const createProvinceZodSchema = z.object({
     body: z.object({
          image: z.array(z.string({ required_error: 'Image is required' })),
          title: z.string({ required_error: 'title text is required' }),
          description: z.string({ required_error: 'description text is required' }),
     }),
});

const updateProvinceZodSchema = z.object({
     body: z.object({
          image: z.array(z.string()).optional(),
          title: z.string().optional(),
          description: z.string().optional(),
     }),
});

export const ProvinceValidation = {
     createProvinceZodSchema,
     updateProvinceZodSchema,
};
