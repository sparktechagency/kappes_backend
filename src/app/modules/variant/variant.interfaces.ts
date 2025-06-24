import { Schema } from "mongoose";
import { GRAPHICS_CARD_TYPE, NETWOR_TYPE, OS_TYPE, PROCESSOR_TYPE, RAM_OR_STORAGE_OR_GRAPHICS_CARD, RESOLUTION_TYPE, STORAGE_TYPE, VARIANT_OPTIONS } from "./variant.enums";



export interface IVariant {
    categoryId: Schema.Types.ObjectId;
    subCategoryId: Schema.Types.ObjectId;
    createdBy: Schema.Types.ObjectId;
    slug: string; // replacing all space by - of category-subCategory and make small letter
    color?: {
        name: string;
        code: string;
    };
    storage?: RAM_OR_STORAGE_OR_GRAPHICS_CARD | string;
    ram?: RAM_OR_STORAGE_OR_GRAPHICS_CARD | string;
    network_type?: NETWOR_TYPE[] | string[];
    operating_system?: OS_TYPE | string;
    storage_type?: STORAGE_TYPE | string;
    processor_type?: PROCESSOR_TYPE | string;
    processor?: string; //  i5, i7, Ryzen 5, Ryzen 7
    graphics_card_type?: GRAPHICS_CARD_TYPE | string;
    graphics_card_size?: RAM_OR_STORAGE_OR_GRAPHICS_CARD | string;
    screen_size?: number; // in inch
    resolution?: RESOLUTION_TYPE | string; // HD, Full HD, 4K UHD
    lens_kit?: string; // Body Only, Kit Lens, Dual Lens
    material?: string; //  Leather, Synthetic, Canvas
    size?: string; // EU 38, 39, 40; UK 5, 6, 7,XS, S, M, L, XL
    fabric?: string; // Optional for clothing (e.g., Cotton, Silk)
    weight?: number; // Optional weight for products like dumbbells, sports equipment, etc.
    dimensions?: string;// Single, Queen, King for beds
    capacity?: string; // 1L, 2L
    options?: VARIANT_OPTIONS;
    isDeleted?:boolean;
}