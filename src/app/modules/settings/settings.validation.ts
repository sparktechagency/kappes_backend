import { z } from "zod";


// Define the Socials schema
const updateSocialsShcema = z.object({
    facebook: z.string().min(1, "Facebook is required").optional(),
    whatsapp: z.string().min(1, "Whatsapp is required").optional(),
    instagram: z.string().min(1, "Instagram is required").optional(),
    tiktok: z.string().min(1, "Tiktok is required").optional(),
});

export const updateContactShcema = z.object({
    phone: z.string().min(1, "phone is required").optional(),
    email: z.string().min(1, "email is required").optional(),
    location: z.string().min(1, "location is required").optional(),
});

export const settingsSchema = {
    updateSocialsShcema,
    updateContactShcema,
}