import { z } from "zod";

const createMessageValidationSchema = z.object({
    body: z.object({
        chatId: z.string(),
        text: z.string().optional(),
    })  
})


export const MessageValidation = {
    createMessageValidationSchema
}