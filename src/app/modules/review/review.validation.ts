import { z } from 'zod';
import { REVIEW_TYPES } from './review.enums';

const reviewZodSchema = z.object({
     body: z.object({
          customer: z.string({ required_error: 'customer is required' }),
          rating: z.number({ required_error: 'Rating is required' }),
          comment: z.string({ required_error: 'Comment is required' }),
          refferenceId: z.string({ required_error: 'refferenceId is required' }),
          review_type: z.enum([...(Object.values(REVIEW_TYPES) as [string, ...string[]])]),
     }),
});

export const ReviewValidation = { reviewZodSchema };
