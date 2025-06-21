
import { z } from "zod";

export const locationSuggestQueryZodSchema = z.object({
    query: z.object({
        q: z.string().trim().min(2, 'Query must be at least 2 characters'), // The search term
    }).strict(),
});