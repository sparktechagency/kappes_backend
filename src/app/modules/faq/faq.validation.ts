import { z } from 'zod';

const createFaqZodSchema = z.object({
     body: z.object({
          question: z.string({ required_error: 'Question is required' }),
          answer: z.string({ required_error: 'Answer is required' }),
          type: z.enum(['for_website', 'for_seller'], { required_error: 'Type is required' }),
     }),
});

const getFaqZodSchema = z.object({
     query: z.object({
          type: z.enum(['for_website', 'for_seller'], { required_error: 'Type is required' }),
     }),
});

export const FaqValidation = {
     createFaqZodSchema,
     getFaqZodSchema,
};
