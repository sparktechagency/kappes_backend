import { Model, Types } from 'mongoose';

export interface IProduct {
    name: string;
    model:string;
    brand: Types.ObjectId;
    viewCount: number;
    purchaseCount: number;
    categoryId: Types.ObjectId;
    subCategoryId: Types.ObjectId;
    productVariantDetails: [{
        variantId: Types.ObjectId;
        variant_price: number;
        variant_quantity: number;
    }];

};

export type ProductModel = Model<IProduct>;
