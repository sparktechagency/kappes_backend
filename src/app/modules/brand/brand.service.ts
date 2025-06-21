import { StatusCodes } from 'http-status-codes';
import QueryBuilder from '../../builder/QueryBuilder';
import { IBrand } from './brand.interface';
import { Brand } from './brand.model';
import unlinkFile from '../../../shared/unlinkFile';
import { User } from '../user/user.model';
import AppError from '../../../errors/AppError';
import { Product } from '../product/product.model';
import { USER_ROLES } from '../user/user.enums';
import { IUser } from '../user/user.interface';
import { IJwtPayload } from '../auth/auth.interface';


const createBrandToDB = async (payload: IBrand,user: IJwtPayload) => {
   const { name, logo, createdBy } = payload;
   const isExistBrand = await Brand.findOne({ name });

   if (isExistBrand) {
      unlinkFile(logo);
      throw new AppError(StatusCodes.NOT_ACCEPTABLE, 'This Brand Name Already Exists');
   }

   const isExistUser = await User.findById(user.id)

   if (!isExistUser) {
      throw new AppError(StatusCodes.NOT_ACCEPTABLE, 'This User not Exists');
   }

   const newBrand = new Brand({
      name,
      logo,
      createdBy: isExistUser._id,
   });

   const createdBrand = await newBrand.save();

   if (!createdBrand) {
      unlinkFile(logo);
      throw new AppError(StatusCodes.BAD_REQUEST, 'Failed to create Category');
   }

   return createdBrand;
};



const getAllBrand = async (query: Record<string, unknown>) => {
   const brandQuery = new QueryBuilder(Brand.find(), query)
      .search(['name'])
      .filter()
      .sort()
      .paginate()
      .fields();

   const result = await brandQuery.modelQuery;
   const meta = await brandQuery.countTotal();

   return {
      meta,
      result,
   };
};

const updateBrandIntoDB = async (
   id: string,
   payload: Partial<IBrand>,
   user: IJwtPayload
) => {
   const isBrandExist = await Brand.findById(id);
   if (!isBrandExist) {
      throw new AppError(StatusCodes.NOT_FOUND, 'Brand not found!');
   }

   if (
      user.role === USER_ROLES.SHOP_ADMIN || user.role === USER_ROLES.VENDOR &&
      isBrandExist.createdBy.toString() !== user.id
   ) {
      throw new AppError(
         StatusCodes.BAD_REQUEST,
         'You are not able to update the brand!'
      );
   }

   const result = await Brand.findByIdAndUpdate(id, payload, { new: true });

   return result;
};

const deleteBrandIntoDB = async (
   id: string,
   user: IJwtPayload
) => {
   const isBrandExist = await Brand.findById(id);
   if (!isBrandExist) {
      throw new AppError(StatusCodes.NOT_FOUND, 'Brand not found!');
   }

   if (
      user.role === USER_ROLES.SHOP_ADMIN || user.role === USER_ROLES.VENDOR &&
      isBrandExist.createdBy.toString() !== user.id
   ) {
      throw new AppError(
         StatusCodes.BAD_REQUEST,
         'You are not able to delete the brand!'
      );
   }

   const product = await Product.findOne({ brand: id })
   if (product) throw new AppError(StatusCodes.BAD_REQUEST, "You can not delete the brand. Because the brand is related to products.");

   const deletedBrand = await Brand.findByIdAndDelete(id);
   return deletedBrand;
};

export const BrandService = {
   createBrandToDB,
   getAllBrand,
   updateBrandIntoDB,
   deleteBrandIntoDB
};
