import mongoose from 'mongoose';
import { IVariant } from '../variant/variant.interfaces';

export interface IProductSingleVariant {
    variantId: mongoose.Types.ObjectId;
    variantQuantity: number;
    variantPrice: number;
}

export interface IProductSingleVariantByFieldName extends Partial<IVariant> {
    variantQuantity: number;
    variantPrice: number;
}

export interface IProduct extends mongoose.Document {
    name: string;
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
    createdBy: mongoose.Types.ObjectId;
    reviews: mongoose.Types.ObjectId[];
    totalReviews: number;
    product_variant_Details: IProductSingleVariant[];
    isDeleted: boolean;
    deletedAt: Date;
    isRecommended: boolean;

    calculateOfferPrice(): Promise<number | null>;
}


export interface ICreateProductRequest {
    name: string;
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