import mongoose from 'mongoose';
import { IVariant } from '../variant/variant.interfaces';
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
     weight?: number;
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

     calculateOfferPrice(): Promise<number | null>;

     // chitchats
     chitchats_weight_unit: 'g';
     chitchats_weight: number;
     chitchats_size_unit: 'cm';
     chitchats_size_x: number;
     chitchats_size_y: number;
     chitchats_size_z: number;
     chitchats_manufacturer_contact: string;
     chitchats_manufacturer_street: string;
     chitchats_manufacturer_city: string;
     chitchats_manufacturer_postal_code: string;
     chitchats_manufacturer_province_code: string;
     chitchats_description: string; // description
     chitchats_value_amount: string; // base rate
     chitchats_currency_code: string;
     chitchats_hs_tariff_code: string;
     chitchats_origin_country: string;
}

export interface ICreateProductRequest {
     name: string;
     territory?: string;
     city?: string;
     province?: string;
     description: string;
     basePrice: number;
     weight?: number;
     tags: string[];
     categoryId: mongoose.Types.ObjectId;
     subcategoryId: mongoose.Types.ObjectId;
     shopId: mongoose.Types.ObjectId;
     brandId: mongoose.Types.ObjectId;
     product_variant_Details: IProductSingleVariant[] | IProductSingleVariantByFieldName[];
}
