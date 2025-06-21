
import { IVariant } from "./variant.interfaces";

// Helper function to get the first word or value of a string, array, or object
const getFirstWord = (value: string | string[] | undefined | object): string => {
    if (Array.isArray(value)) {
        // If it's an array, get the first word of the first element
        return value[0] ? value[0].split(' ')[0] : '';  // Handle array case
    }
    if (typeof value === 'object' && value !== null) {
        // If it's an object, check if it has a `code` (for color) or a `name`
        const firstValue = (value as { code: string; name: string }).code || (value as { code: string; name: string }).name;
        return firstValue ? firstValue.split(' ')[0] : ''; // Extract from code or name
    }
    return value ? value.split(' ')[0] : ''; // For string or undefined
};

// Define the field order based on Zod schema for slug generation
const SLUG_FIELD_ORDER = [
    'categoryId',
    'subCategoryId',
    'color',
    'storage',
    'ram',
    'network_type',
    'operating_system',
    'storage_type',
    'processor_type',
    'processor',
    'graphics_card_type',
    'graphics_card_size',
    'screen_size',
    'resolution',
    'lens_kit',
    'material',
    'size',
    'fabric',
    'weight',
    'dimensions',
    'capacity',
    'options'
];

// Function to check if a value is an ObjectId (for MongoDB)
const isObjectId = (value: any): boolean => {
    return typeof value === 'string' && /^[a-fA-F0-9]{24}$/.test(value);
};

// Function to clean up the slug by removing or replacing special characters (like #)
const cleanSlugValue = (value: string): string => {
    // Remove or replace the '#' character with an empty string
    return value.replace(/#/g, '');  // Replace '#' with an empty string
};

// Modify generateSlug to accept both the full payload and a partial update
export const generateSlug = (categoryName: string, subCategoryName: string, payload: Partial<IVariant>): string => {
    const slugParts: string[] = [
        getFirstWord(categoryName),
        getFirstWord(subCategoryName),
    ];

    // Generate the slug based on the field order
    SLUG_FIELD_ORDER.forEach(field => {
        if (payload[field as keyof IVariant]) {
            const value = payload[field as keyof IVariant];
            if (isObjectId(value)) return; // Skip ObjectId fields
            const firstWord = getFirstWord(value as string);
            if (firstWord) {
                const cleanFirstWord = cleanSlugValue(firstWord); // Clean up special characters
                if (cleanFirstWord) slugParts.push(cleanFirstWord); // Add cleaned value to slug if valid
            }
        }
    });

    // Join the parts with a hyphen and convert to lowercase
    const slug = slugParts.join('-').toLowerCase();
    return slug;
};
