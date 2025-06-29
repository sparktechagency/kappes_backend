
import { z } from 'zod';
import { BUSINESS_TYPES } from './business.enums';

export const businessSearchQueryZodSchema = z.object({
    query: z.object({
        // Geospatial search parameters (latitude, longitude, radius)
        latitude: z.preprocess((val) => Number(val), z.number().min(-90).max(90)).optional(),
        longitude: z.preprocess((val) => Number(val), z.number().min(-180).max(180)).optional(),
        radius: z.preprocess((val) => Number(val), z.number().positive()).optional(), // Radius in meters

        // Text-based search for province/city/territory/name
        searchByLocationText: z.string().trim().optional(), // For text-based location search (e.g., "New York")

        // Other business search filters
        searchTerm: z.string().trim().optional(), // For business name/description
        // ... any other filters
    }).partial().strict(),
});

const createBusinessZodSchema = z.object({
    body: z.object({
        name: z.string({ required_error: 'Name is required' }),
        type: z.enum(Object.values(BUSINESS_TYPES) as [string, ...string[]], {
            required_error: 'Type is required'
        }),
        email: z.string({ required_error: 'Email is required' }),
        phone: z.string({ required_error: 'Phone is required' }),
        description: z.string({ required_error: 'Description is required' }),
        address: z.object({
            province: z.string({ required_error: 'Province is required' }),
            city: z.string({ required_error: 'City is required' }).optional(),
            territory: z.string({ required_error: 'Territory is required' }),
            country: z.string({ required_error: 'Country is required' }),
            detail_address: z.string({ required_error: 'Detail address is required' }).optional(),
        }),
        service: z.string({ required_error: 'Service is required' }),
        working_hours: z.array(z.object({
            day: z.string({ required_error: 'Day is required' }),
            start: z.string({ required_error: 'Start time is required' }),
            end: z.string({ required_error: 'End time is required' }),
        })),
    }),
});
// make updateBus all field optional
const updateBusinessZodSchema = z.object({
    body: z.object({
        name: z.string({ required_error: 'Name is required' }).optional(),
        type: z.enum(Object.values(BUSINESS_TYPES) as [string, ...string[]], {
            required_error: 'Type is required'
        }).optional(),
        email: z.string({ required_error: 'Email is required' }).optional(),
        phone: z.string({ required_error: 'Phone is required' }).optional(),
        description: z.string({ required_error: 'Description is required' }).optional(),
        address: z.object({
            province: z.string({ required_error: 'Province is required' }).optional(),
            city: z.string({ required_error: 'City is required' }).optional(),
            territory: z.string({ required_error: 'Territory is required' }).optional(),
            country: z.string({ required_error: 'Country is required' }).optional(),
            detail_address: z.string({ required_error: 'Detail address is required' }).optional(),
        }).optional(),
        service: z.string({ required_error: 'Service is required' }).optional(),
        working_hours: z.array(z.object({
            day: z.string({ required_error: 'Day is required' }),
            start: z.string({ required_error: 'Start time is required' }),
            end: z.string({ required_error: 'End time is required' }),
        })).optional(),
        logo: z.string({ required_error: 'Logo is required' }).optional(),
        coverPhoto: z.string({ required_error: 'Cover photo is required' }).optional(),
        banner: z.string({ required_error: 'Banner is required' }).optional(),
    }),
});
const createVerifyEmailZodSchema = z.object({
    body: z.object({
        email: z.string({ required_error: 'Email is required' }),
        oneTimeCode: z.number({ required_error: 'One time code is required' }),
    }),
});

const createResendOtpZodSchema = z.object({
    body: z.object({
        email: z.string({ required_error: 'Email is required' }),
    }),
});

const createMessageZodSchema = z.object({
    body: z.object({
        message: z.string({ required_error: 'Message is required' }),
        senderName: z.string({ required_error: 'Sender name is required' }),
        senderEmail: z.string({ required_error: 'Sender email is required' }),
    }),
});





export const BusinessValidation = {
    createBusinessZodSchema,
    updateBusinessZodSchema,
    createVerifyEmailZodSchema,
    createMessageZodSchema,
    createResendOtpZodSchema
}