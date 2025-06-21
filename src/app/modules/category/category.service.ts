import { StatusCodes } from 'http-status-codes';
import { ICategory } from './category.interface';
import { Category } from './category.model';
import unlinkFile from '../../../shared/unlinkFile';
import AppError from '../../../errors/AppError';
import QueryBuilder from '../../builder/QueryBuilder';
import { User } from '../user/user.model';
import { SubCategory } from '../subCategorys/subCategory.model';
import { USER_ROLES } from '../user/user.enums';
import { Video } from '../admin/videosManagement/videoManagement.model';
import { Favourite } from '../favourit/favourit.model';
import { Product } from '../product/product.model';
import { IJwtPayload } from '../auth/auth.interface';

const createCategoryToDB = async (payload: ICategory, user: IJwtPayload) => {
     const { name, thumbnail, description } = payload;
     const isExistName = await Category.findOne({ name });

     if (isExistName) {
          unlinkFile(thumbnail);
          throw new AppError(StatusCodes.NOT_ACCEPTABLE, 'This Category Name Already Exists');
     }
     const newCategory = new Category({
          name,
          thumbnail,
          description,
          createdBy: user.id
     });

     const createdCategory = await newCategory.save();

     if (!createdCategory) {
          unlinkFile(thumbnail);
          throw new AppError(StatusCodes.BAD_REQUEST, 'Failed to create Category');
     }

     return createdCategory;
};
// get c  ategorys
const getCategoriesFromDB = async (query: Record<string, unknown>) => {
     const queryBuilder = new QueryBuilder(Category.find({}), query);
     const categorys = await queryBuilder
          .fields()
          .filter()
          .paginate()
          .search(['name'])
          .sort()
          .modelQuery.populate({
               path: 'subCategory',
               select: {
                    name: 1,
               },
          })
          .exec();
     const meta = await queryBuilder.countTotal();
     return {
          categorys,
          meta,
     };
};
// update catgeory
const updateCategoryToDB = async (id: string, payload: ICategory, user: IJwtPayload) => {
     const isExistCategory: any = await Category.findById(id);

     if (!isExistCategory) {
          throw new AppError(StatusCodes.BAD_REQUEST, "Category doesn't exist");
     }

     if (
          user.role === USER_ROLES.SHOP_ADMIN || user.role === USER_ROLES.VENDOR &&
          isExistCategory.createdBy.toString() !== user.id
     ) {
          throw new AppError(
               StatusCodes.BAD_REQUEST,
               'You are not able to update the Category!'
          );
     }

     if (payload.thumbnail && isExistCategory?.thumbnail) {
          unlinkFile(isExistCategory?.thumbnail);
     }

     const updateCategory = await Category.findByIdAndUpdate(id, payload, {
          new: true,
     });

     if (!updateCategory) {
          throw new AppError(StatusCodes.BAD_REQUEST, 'Faield to update category!');
     }
     return updateCategory;
};
// update catgeory status
const updateCategoryStatusToDB = async (id: string, payload: string) => {
     const isExistCategory: any = await Category.findById(id);

     if (!isExistCategory) {
          throw new AppError(StatusCodes.BAD_REQUEST, "Category doesn't exist");
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
          throw new AppError(StatusCodes.BAD_REQUEST, 'Faield to update category!');
     }
     return updateCategory;
};

// delete category
const deleteCategoryToDB = async (id: string, user: IJwtPayload) => {

     const product = await Product.findOne({ categoryId: id })
     if (product) throw new AppError(StatusCodes.BAD_REQUEST, "You can not delete the Category. Because the Category is related to products.");

     const isExistCategory = await Category.findById(id);
     if (!isExistCategory) {
          throw new AppError(StatusCodes.BAD_REQUEST, "Category doesn't exist");
     }

     if (
          user.role === USER_ROLES.SHOP_ADMIN || user.role === USER_ROLES.VENDOR &&
          isExistCategory.createdBy.toString() !== user.id
     ) {
          throw new AppError(
               StatusCodes.BAD_REQUEST,
               'You are not able to delete the Category!'
          );
     }
     isExistCategory.set({ isDeleted: true });
     // Save the updated variant
     await isExistCategory.save();

     return isExistCategory;
};
const getSingleCategoryFromDB = async (id: string, userId: string) => {
     const result = await Category.findById(id).populate('subCategory');
     if (!result) {
          throw new AppError(StatusCodes.NOT_FOUND, 'Category not found');
     }
     if (userId) {
          const isExist = await User.findById(userId);
          if (!isExist) {
               throw new AppError(StatusCodes.NOT_FOUND, 'User not found');
          }
          if (isExist?.role === USER_ROLES.SUPER_ADMIN || isExist?.role === USER_ROLES.ADMIN) {
               result.ctgViewCount += 1;
               await result.save();
          }
     }
     return result;
};
const getSubcategoryWithCategoryIdFromDB = async (id: string, query: Record<string, unknown>) => {
     const queryBuilder = new QueryBuilder(SubCategory.find({ categoryId: id }), query);
     const result = await queryBuilder
          .fields()
          .filter()
          .paginate()
          .search(['name'])
          .sort()
          .modelQuery.populate({
               path: 'categoryId',
               select: {
                    name: 1,
               },
          })
          .exec();
     const meta = await queryBuilder.countTotal();
     return {
          result,
          meta,
     };
};



const getPopularCategorisFromDB = async (query: Record<string, unknown>) => {
     const queryBuilder = new QueryBuilder(Category.find(), query);
     const result = await queryBuilder.fields().filter().paginate().search(['name']).sort().modelQuery.exec();
     const meta = await queryBuilder.countTotal();
     return {
          result,
          meta,
     };
};



export const CategoryService = {
     createCategoryToDB,
     getCategoriesFromDB,
     updateCategoryToDB,
     deleteCategoryToDB,
     updateCategoryStatusToDB,
     getSingleCategoryFromDB,
     getSubcategoryWithCategoryIdFromDB,
     getPopularCategorisFromDB
};
