import mongoose from 'mongoose';
import { IVariant } from '../variant/variant.interfaces';
import { chitChatShipment_package_type, chitChatShipment_size_unit, chitChatShipment_weight_unit } from '../third-party-modules/chitChatShipment/chitChatShipment.enum';
interface ISlugDetails {
     [key: string]: string[]; // The key is the field name (e.g., 'color', 'size'), and the value is an array of strings
}

export interface IProductSingleVariant {
     variantId: mongoose.Types.ObjectId;
     variantQuantity: number;
     variantPrice: number;
     slug?: string;
}

export interface IProductSingleVariantByFieldName extends Partial<IVariant> {
     variantQuantity: number;
     variantPrice: number;
}

export interface IProduct extends mongoose.Document {
     name: string;
     territory?: string;
     city?: string;
     province?: string;
     description: string;
     basePrice: number;
     totalStock: number;
     images: string[];
     isFeatured: boolean;
     weight: number;
     tags: string[];
     avg_rating: number;
     //  .....
     purchaseCount: number;
     viewCount: number;
     categoryId: mongoose.Types.ObjectId;
     shopId: mongoose.Types.ObjectId;
     subcategoryId: mongoose.Types.ObjectId;
     brandId: mongoose.Types.ObjectId;
     brandName?: string;
     createdBy: mongoose.Types.ObjectId;
     reviews: mongoose.Types.ObjectId[];
     totalReviews: number;
     product_variant_Details: IProductSingleVariant[];
     isDeleted: boolean;
     deletedAt: Date;
     isRecommended: boolean;
     slugDetails: ISlugDetails;

     // chitchat shipment fields

     package_type?: chitChatShipment_package_type;
     weight_unit?: chitChatShipment_weight_unit;
     size_unit?: chitChatShipment_size_unit;
     size_x?: number;
     size_y?: number;
     size_z?: number;
     manufacturer_contact?: string;
     manufacturer_street?: string;
     manufacturer_city?: string;
     manufacturer_postal_code?: string;
     manufacturer_province_code?: string;
     hs_tariff_code?: string;
     origin_country?: string;

     calculateOfferPrice(): Promise<number | null>;
}

export interface ICreateProductRequest {
     name: string;
     territory?: string;
     city?: string;
     province?: string;
     description: string;
     basePrice: number;
     weight: number;
     tags: string[];
     categoryId: mongoose.Types.ObjectId;
     subcategoryId: mongoose.Types.ObjectId;
     shopId: mongoose.Types.ObjectId;
     brandId: mongoose.Types.ObjectId;
     product_variant_Details: IProductSingleVariant[] | IProductSingleVariantByFieldName[];
}
