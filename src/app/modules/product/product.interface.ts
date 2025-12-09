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
