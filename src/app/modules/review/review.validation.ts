import { z } from 'zod';
import { REVIEW_TYPES } from './review.enums';
import { objectIdSchema } from '../variant/variant.validation';

const reviewZodSchema = z.object({
     body: z.object({
          rating: z.number({ required_error: 'Rating is required' }),
          comment: z.string({ required_error: 'Comment is required' }),
          refferenceId: objectIdSchema,
          review_type: z.enum([...(Object.values(REVIEW_TYPES) as [string, ...string[]])]),
          images: z.array(z.string()).optional(),
     }),
});

export const ReviewValidation = { reviewZodSchema };
