import { VARIANT_OPTIONS } from "../variant/variant.enums";
import { Schema } from "mongoose";

export interface ISingleVariantField {
    name: string;
    code?: string;
}

export interface IVariantField {
    _id?: Schema.Types.ObjectId;
    color?: ISingleVariantField[];
    storage?: ISingleVariantField[];
    ram?: ISingleVariantField[];
    network_type?: ISingleVariantField[];
    operating_system?: ISingleVariantField[];
    storage_type?: ISingleVariantField[];
    processor_type?: ISingleVariantField[];
    processor?: ISingleVariantField[]; //  i5, i7, Ryzen 5, Ryzen 7
    graphics_card_type?: ISingleVariantField[];
    graphics_card_size?: ISingleVariantField[];
    screen_size?: ISingleVariantField[]; // in inch
    resolution?: ISingleVariantField[]; // HD, Full HD, 4K UHD
    lens_kit?: ISingleVariantField[]; // Body Only, Kit Lens, Dual Lens
    material?: ISingleVariantField[]; //  Leather, Synthetic, Canvas
    size?: ISingleVariantField[]; // EU 38, 39, 40; UK 5, 6, 7,XS, S, M, L, XL
    fabric?: ISingleVariantField[]; // Optional for clothing (e.g., Cotton, Silk)
    weight?: ISingleVariantField[]; // Optional weight for products like dumbbells, sports equipment, etc.
    dimensions?: ISingleVariantField[];// Single, Queen, King for beds
    capacity?: ISingleVariantField[]; // 1L, 2L
    options?: VARIANT_OPTIONS[];
}