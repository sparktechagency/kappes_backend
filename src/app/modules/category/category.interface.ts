import mongoose, { Schema } from 'mongoose';
export interface ISubCategory {
     name: string;
     thumbnail: string;
     categoryId: mongoose.Schema.Types.ObjectId;
}

export interface ICategory {
     name: string;
     thumbnail: string;
     subCategory: ISubCategory[] | [];
     description: string;
     status: string;
     isDeleted: boolean;
     ctgViewCount: number;
     createdBy: Schema.Types.ObjectId;
}
