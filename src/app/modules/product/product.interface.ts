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

export interface IProduct {
    name: string;
    description: string;
    basePrice: number;
    images: string[];
    shopId: mongoose.Types.ObjectId;
    totalStock: number;
    isActive: boolean;
    isFeatured: boolean;
    weight?: number;
    tags: string[];
    avg_rating: number;
    //  .....
    purchaseCount: number;
    viewCount: number;
    categoryId: mongoose.Types.ObjectId;
    subcategoryId: mongoose.Types.ObjectId;
    comments: mongoose.Types.ObjectId[];
    totalReviews: number;
    product_variant_Details: IProductSingleVariant[];
}


export interface ICreateProductRequest {
    name: string;
    description: string;
    price: number;
    categoryId: mongoose.Types.ObjectId;
    subcategoryId: mongoose.Types.ObjectId;
    product_variant_Details: IProductSingleVariant[] | IProductSingleVariantByFieldName[];
}