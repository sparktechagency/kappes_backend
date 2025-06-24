import { z } from "zod";
import { objectIdSchema } from "../user/user.validation";

const createOfferSchema = z.object({
    body: z.object({
        products: z.array(objectIdSchema),
        discountPercentage: z.number().min(0).max(100),
    })
})

export const OfferedValidation = {
    createOfferSchema
}