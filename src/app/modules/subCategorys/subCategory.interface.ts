import { Types } from 'mongoose';

export interface ISubCategory {
     name: string;
     thumbnail: string;
     description: string;
     categoryId: Types.ObjectId; 
     createdBy: Types.ObjectId;
     variants?: Types.ObjectId[];
     status: string;
     isDeleted: boolean;
}
