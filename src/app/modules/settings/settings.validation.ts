import { z } from 'zod';

// Define the Socials schema
const updateSocialsShcema = z.object({
     facebook: z.string().min(1, 'Facebook is required').optional(),
     whatsapp: z.string().min(1, 'Whatsapp is required').optional(),
     instagram: z.string().min(1, 'Instagram is required').optional(),
     tiktok: z.string().min(1, 'Tiktok is required').optional(),
});

export const updateContactShcema = z.object({
     phone: z.string().min(1, 'phone is required').optional(),
     email: z.string().min(1, 'email is required').optional(),
     location: z.string().min(1, 'location is required').optional(),
});

const updateShippingDetailsSchema = z.object({
     freeShipping: z.object({
          area: z.array(z.string()).min(1, 'Area is required'),
          cost: z.number().min(1, 'Cost is required'),
     }),
     centralShipping: z.object({
          area: z.array(z.string()).min(1, 'Area is required'),
          cost: z.number().min(1, 'Cost is required'),
     }),
     countryShipping: z.object({
          area: z.array(z.string()).min(1, 'Area is required'),
          cost: z.number().min(1, 'Cost is required'),
     }),
     worldWideShipping: z.object({
          cost: z.number().min(1, 'Cost is required'),
     }),
});

const createMessageZodSchema = z.object({
     body: z.object({
          message: z.string({ required_error: 'Message is required' }),
          senderName: z.string({ required_error: 'Sender name is required' }),
          senderEmail: z.string({ required_error: 'Sender email is required' }),
          phone: z.string({ required_error: 'Phone is required' }).optional(),
     }),
});

const createOrUpdateBannerSchema = z.object({
     banner: z.array(z.string({ required_error: 'Banner is required' })).optional(),
     logo: z.string({ required_error: 'Logo is required' }).optional(),
});

export const settingsSchema = {
     updateSocialsShcema,
     updateContactShcema,
     updateShippingDetailsSchema,
     createMessageZodSchema,
     createOrUpdateBannerSchema,
};
