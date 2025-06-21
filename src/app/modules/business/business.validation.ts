
import { z } from 'zod';

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