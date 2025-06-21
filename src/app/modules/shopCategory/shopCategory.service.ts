import { StatusCodes } from 'http-status-codes';
import QueryBuilder from '../../builder/QueryBuilder';
import unlinkFile from '../../../shared/unlinkFile';
import { User } from '../user/user.model';
import AppError from '../../../errors/AppError';
import { Product } from '../product/product.model';
import { USER_ROLES } from '../user/user.enums';
import { IUser } from '../user/user.interface';
import { IJwtPayload } from '../auth/auth.interface';
import { IShopCategory } from './shopCategory.interface';
import { ShopCategory } from './shopCategory.model';
import { Shop } from '../shop/shop.model';


const createShopCategoryToDB = async (payload: IShopCategory, user: IJwtPayload) => {
   const { name } = payload;
   const isExistShopCategory = await ShopCategory.findOne({ name });

   if (isExistShopCategory) {
      throw new AppError(StatusCodes.NOT_ACCEPTABLE, 'This Shop Category Name Already Exists');
   }

   const isExistUser = await User.findById(user.id)

   if (!isExistUser) {
      throw new AppError(StatusCodes.NOT_ACCEPTABLE, 'This User not Exists');
   }

   const newShopCategory = new ShopCategory({
      name,
      createdBy: isExistUser._id,
   });

   const createdShopCategory = await newShopCategory.save();

   if (!createdShopCategory) {
      throw new AppError(StatusCodes.BAD_REQUEST, 'Failed to create Category');
   }

   return createdShopCategory;
};



const getAllShopCategory = async (query: Record<string, unknown>) => {
   const shopCategoryQuery = new QueryBuilder(ShopCategory.find(), query)
      .search(['name'])
      .filter()
      .sort()
      .paginate()
      .fields();

   const result = await shopCategoryQuery.modelQuery;
   const meta = await shopCategoryQuery.countTotal();

   return {
      meta,
      result,
   };
};

const updateShopCategoryIntoDB = async (
   id: string,
   payload: Partial<IShopCategory>,
   user: IJwtPayload
) => {
   const isShopCategoryExist = await ShopCategory.findById(id);
   if (!isShopCategoryExist) {
      throw new AppError(StatusCodes.NOT_FOUND, 'Shop Category not found!');
   }

   if (
      user.role === USER_ROLES.SHOP_ADMIN || user.role === USER_ROLES.VENDOR &&
      isShopCategoryExist.createdBy.toString() !== user.id
   ) {
      throw new AppError(
         StatusCodes.BAD_REQUEST,
         'You are not able to update the shop category!'
      );
   }

   const result = await ShopCategory.findByIdAndUpdate(id, payload, { new: true });

   return result;
};

const deleteShopCategoryIntoDB = async (
   id: string,
   user: IJwtPayload
) => {
   const isShopCategoryExist = await ShopCategory.findById(id);
   if (!isShopCategoryExist) {
      throw new AppError(StatusCodes.NOT_FOUND, 'Shop Category not found!');
   }

   if (
      user.role === USER_ROLES.SHOP_ADMIN || user.role === USER_ROLES.VENDOR &&
      isShopCategoryExist.createdBy.toString() !== user.id
   ) {
      throw new AppError(
         StatusCodes.BAD_REQUEST,
         'You are not able to delete the shop category!'
      );
   }

   const shopCategory = await Shop.findOne({ categories: id });
   if (shopCategory) throw new AppError(StatusCodes.BAD_REQUEST, "You can not delete the shop category. Because the shop category is related to products.");

   const deletedShopCategory = await ShopCategory.findByIdAndDelete(id);
   return deletedShopCategory;
};

export const ShopCategoryService = {
   createShopCategoryToDB,
   getAllShopCategory,
   updateShopCategoryIntoDB,
   deleteShopCategoryIntoDB
};
