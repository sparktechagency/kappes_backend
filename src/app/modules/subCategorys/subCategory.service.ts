import { StatusCodes } from 'http-status-codes';
import unlinkFile from '../../../shared/unlinkFile';
import AppError from '../../../errors/AppError';
import { SubCategory } from './subCategory.model';
import { ISubCategory } from './subCategory.interface';
import QueryBuilder from '../../builder/QueryBuilder';
import { Category } from '../category/category.model';
import { Video } from '../admin/videosManagement/videoManagement.model';
import { Favourite } from '../favourit/favourit.model';
import { User } from '../user/user.model';
import { Product } from '../product/product.model';
import { IJwtPayload } from '../auth/auth.interface';
import { USER_ROLES } from '../user/user.enums';
// create sub category
const createSubCategoryToDB = async (payload: ISubCategory, user: IJwtPayload) => {
     const { name, thumbnail, categoryId } = payload;
     const isExistCategory = await Category.findById(categoryId);
     if (!isExistCategory) {
          throw new AppError(StatusCodes.NOT_FOUND, 'Category not found!');
     }
     const isSubCategoryExistName = await SubCategory.findOne({ name: name });
     if (isSubCategoryExistName) {
          unlinkFile(thumbnail);
          throw new AppError(StatusCodes.NOT_ACCEPTABLE, 'This SubCategory Name Already Exists');
     }

     const createSubCategory = await SubCategory.create({ ...payload, createdBy: user.id });
     if (!createSubCategory) {
          unlinkFile(thumbnail);
          throw new AppError(StatusCodes.BAD_REQUEST, 'Failed to create subcategory');
     }
     await Category.findByIdAndUpdate(
          categoryId,
          {
               $push: { subCategory: createSubCategory._id },
          },
          { new: true },
     );

     return createSubCategory;
};
// get sub category
const getCategoriesFromDB = async (query: Record<string, unknown>) => {
     const queryBuilder = new QueryBuilder(SubCategory.find({}).populate("categoryId", "name"), query);
     const subCategorys = await queryBuilder.fields().filter().paginate().search(['name']).sort().modelQuery.exec();
     const meta = await queryBuilder.countTotal();
     return {
          subCategorys,
          meta,
     };
};
// update sub category
const updateSubCategoryToDB = async (id: string, payload: ISubCategory, user: IJwtPayload) => {
     const isExistSubCategory: any = await SubCategory.findById(id);

     if (!isExistSubCategory) {
          throw new AppError(StatusCodes.BAD_REQUEST, "SubCategory doesn't exist");
     }

     if (
          user.role === USER_ROLES.SHOP_ADMIN || user.role === USER_ROLES.VENDOR &&
          isExistSubCategory.createdBy.toString() !== user.id
     ) {
          throw new AppError(
               StatusCodes.BAD_REQUEST,
               'You are not able to update the SubCategory!'
          );
     }

     if (payload.thumbnail && isExistSubCategory.thumbnail) {
          unlinkFile(isExistSubCategory?.thumbnail);
     }

     const updateSubCategory = await SubCategory.findByIdAndUpdate(id, payload, {
          new: true,
     });

     if (!updateSubCategory) {
          throw new AppError(StatusCodes.BAD_REQUEST, 'Faield to update SubCategory!');
     }

     return updateSubCategory;
};

const deleteSubCategoryToDB = async (id: string, user: IJwtPayload) => {
     const product = await Product.findOne({ subcategoryId: id })
     if (product) throw new AppError(StatusCodes.BAD_REQUEST, "You can not delete the subcategory. Because the subcategory is related to products.");

     const isExistSubCategory = await SubCategory.findById(id);
     if (!isExistSubCategory) {
          throw new AppError(StatusCodes.BAD_REQUEST, "SubCategory doesn't exist");
     }
     if (
          user.role === USER_ROLES.SHOP_ADMIN || user.role === USER_ROLES.VENDOR &&
          isExistSubCategory.createdBy.toString() !== user.id
     ) {
          throw new AppError(
               StatusCodes.BAD_REQUEST,
               'You are not able to delete the Category!'
          );
     }
     isExistSubCategory.set({ isDeleted: true });
     // Save the updated variant
     await isExistSubCategory.save();

     return isExistSubCategory;
};
// update catgeory status
const updateSubCategoryStatusToDB = async (id: string, payload: string) => {
     const isExistCategory: any = await SubCategory.findById(id);

     if (!isExistCategory) {
          throw new AppError(StatusCodes.BAD_REQUEST, "subcategory doesn't exist");
     }

     const updateCategory = await Category.findByIdAndUpdate(
          id,
          {
               $set: { status: payload },
          },
          {
               new: true,
          },
     );

     if (!updateCategory) {
          throw new AppError(StatusCodes.BAD_REQUEST, 'Faield to update subcategory!');
     }
     return updateCategory;
};
const getSubCategoryReletedToCategory = async (id: string) => {
     const result = await SubCategory.find({ categoryId: id }).populate("categoryId", "name");
     if (!result) {
          return [];
     }
     return result;
};
const getFevVideosOrNot = async (videoId: string, userId: string) => {
     const favorite = await Favourite.findOne({ videoId, userId });
     return favorite ? true : false;
};


const getSubCategoryDetails = async (id: string) => {
     const result = await SubCategory.findById(id).populate("categoryId", "name");
     if (!result) {
          throw new AppError(StatusCodes.NOT_FOUND, 'SubCategory not found');
     }
     return result;
};
export const CategoryService = {
     createSubCategoryToDB,
     getCategoriesFromDB,
     updateSubCategoryToDB,
     deleteSubCategoryToDB,
     updateSubCategoryStatusToDB,
     getSubCategoryReletedToCategory,
     getSubCategoryDetails,
};
