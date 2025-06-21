import { z } from "zod";
import { NETWOR_TYPE, RAM_OR_STORAGE_OR_GRAPHICS_CARD, STORAGE_TYPE, PROCESSOR_TYPE, GRAPHICS_CARD_TYPE, RESOLUTION_TYPE, OS_TYPE, VARIANT_OPTIONS } from "./variant.enums";

export const objectIdSchema = z.string().regex(/^[a-f\d]{24}$/i, { message: "Invalid ObjectId" });
const hexColorRegex = /^#[0-9A-Fa-f]{6}$/;
// Zod schema for Variant validation
export const createVariantSchema = z.object({
    body: z.object({
        categoryId: objectIdSchema, // Assuming categoryId is a UUID (change to ObjectId if necessary)
        subCategoryId: objectIdSchema, // Same as categoryId for subCategory
        color: z.object({
            name: z.string().optional(),
            // code: z.string().optional(),
            code: z.string().regex(hexColorRegex, { message: "Invalid hex color code format" }).optional(),
        }).optional(),
        storage: z.union([z.enum([...(Object.values(RAM_OR_STORAGE_OR_GRAPHICS_CARD) as [string, ...string[]])]), z.string()]).optional(),
        ram: z.union([z.enum([...(Object.values(RAM_OR_STORAGE_OR_GRAPHICS_CARD) as [string, ...string[]])]), z.string()]).optional(),
        network_type: z.array(z.union([z.enum([...(Object.values(NETWOR_TYPE) as [string, ...string[]])]), z.string()])).optional(),
        operating_system: z.union([z.enum([...(Object.values(OS_TYPE) as [string, ...string[]])]), z.string()]).optional(),
        storage_type: z.union([z.enum([...(Object.values(STORAGE_TYPE) as [string, ...string[]])]), z.string()]).optional(),
        processor_type: z.union([z.enum([...(Object.values(PROCESSOR_TYPE) as [string, ...string[]])]), z.string()]).optional(),
        processor: z.string().optional(),
        graphics_card_type: z.union([z.enum([...(Object.values(GRAPHICS_CARD_TYPE) as [string, ...string[]])]), z.string()]).optional(),
        graphics_card_size: z.union([z.enum([...(Object.values(RAM_OR_STORAGE_OR_GRAPHICS_CARD) as [string, ...string[]])]), z.string()]).optional(),
        screen_size: z.number().positive().optional(),
        resolution: z.union([z.enum([...(Object.values(RESOLUTION_TYPE) as [string, ...string[]])]), z.string()]).optional(),
        lens_kit: z.string().optional(),
        material: z.string().optional(),
        size: z.string().optional(),
        fabric: z.string().optional(),
        weight: z.number().positive().optional(),
        dimensions: z.string().optional(),
        capacity: z.string().optional(),
        options: z.union([z.enum([...(Object.values(VARIANT_OPTIONS) as [string, ...string[]])]), z.string()]).optional(),
    })
});
const updateVariantSchema = createVariantSchema.partial()
export const variantValidation = {
    createVariantSchema,
    updateVariantSchema
}

export type IVariantZod = z.infer<typeof createVariantSchema>;
