import { Product } from './product.model';
import { ICreateProductRequest, IProduct, IProductSingleVariant, IProductSingleVariantByFieldName } from './product.interface';
import { StatusCodes } from 'http-status-codes';
import { IJwtPayload } from '../auth/auth.interface';
import mongoose from 'mongoose';
import AppError from '../../../errors/AppError';
import QueryBuilder from '../../builder/QueryBuilder';
import unlinkFile from '../../../shared/unlinkFile';
import { generateSlug } from '../variant/variant.utils';
import Variant from '../variant/variant.model';
import { Shop } from '../shop/shop.model';
import { Category } from '../category/category.model';
import { SubCategory } from '../subCategorys/subCategory.model';
import { Brand } from '../brand/brand.model';
import { USER_ROLES } from '../user/user.enums';
import { IVariant } from '../variant/variant.interfaces';
import { ObjectId } from 'mongodb';

const createProduct = async (payload: IProduct, user: IJwtPayload) => {
     const session = await mongoose.startSession();
     session.startTransaction();

     try {
          // Check if shop exists and user is authorized
          const shop = await Shop.findById(payload.shopId, null, { session });
          if (!shop) {
               throw new AppError(StatusCodes.NOT_FOUND, 'Shop not found');
          }

          if (user.role === USER_ROLES.VENDOR || user.role === USER_ROLES.SHOP_ADMIN) {
               if (shop.owner.toString() !== user.id && !shop.admins?.some((admin) => admin.toString() === user.id)) {
                    throw new AppError(StatusCodes.FORBIDDEN, 'You are not authorized to create a product for this shop');
               }
          }

          // Validate category, subcategory, and brand in parallel
          const [isExistCategory, isExistSubCategory, isExistBrand] = await Promise.all([
               Category.findOne({ _id: payload.categoryId }, null, { session }),
               SubCategory.findOne({ _id: payload.subcategoryId, categoryId: payload.categoryId }, null, { session }),
               Brand.findOne({ _id: payload.brandId }, null, { session }),
          ]);

          if (!isExistCategory) {
               throw new AppError(StatusCodes.NOT_FOUND, 'Category not found');
          }
          if (!isExistSubCategory) {
               throw new AppError(StatusCodes.NOT_FOUND, 'Subcategory not found');
          }
          if (!isExistBrand) {
               throw new AppError(StatusCodes.NOT_FOUND, 'Brand not found');
          }

          // Validate variants
          if (!payload.product_variant_Details || payload.product_variant_Details.length === 0) {
               throw new AppError(StatusCodes.BAD_REQUEST, 'At least one variant is required');
          }

          // Process variants in parallel
          const resolvedVariants = await Promise.all(
               payload.product_variant_Details.map(async (variant, index) => {
                    if (variant.variantId) {
                         // If variantId is provided, check if the variant exists
                         const isExistVariant = await Variant.findOne({ _id: variant.variantId }, null, { session });
                         if (!isExistVariant) {
                              throw new AppError(StatusCodes.NOT_FOUND, `Variant not found by id ${variant.variantId}`);
                         }
                         return {
                              variantId: variant.variantId,
                              variantQuantity: variant.variantQuantity,
                              variantPrice: variant.variantPrice,
                         } as IProductSingleVariant;
                    }

                    // Create a new Variant if variantId is not provided
                    const newVariant = new Variant({
                         ...variant,
                         createdBy: user.id,
                         categoryId: payload.categoryId,
                         subCategoryId: payload.subcategoryId,
                    });

                    const variantSlug = generateSlug(isExistCategory.name, isExistSubCategory.name, variant as IProductSingleVariantByFieldName);

                    const isVariantExistSlug = await Variant.findOne({ slug: variantSlug }, null, { session });
                    if (isVariantExistSlug) {
                         return {
                              variantId: isVariantExistSlug._id,
                              variantQuantity: variant.variantQuantity,
                              variantPrice: variant.variantPrice,
                         } as unknown as IProductSingleVariant;
                    }

                    newVariant.slug = variantSlug;
                    const savedVariant = await newVariant.save({ session });

                    if (!savedVariant) {
                         throw new AppError(StatusCodes.BAD_REQUEST, 'Failed to create Variant');
                    }

                    return {
                         variantId: savedVariant._id,
                         variantQuantity: variant.variantQuantity,
                         variantPrice: variant.variantPrice,
                    } as unknown as IProductSingleVariant;
               }),
          );

          // Calculate total stock and validate variant details
          const totalStock = resolvedVariants.reduce((sum, variant) => {
               if (variant.variantQuantity < 0) {
                    throw new AppError(StatusCodes.BAD_REQUEST, 'Variant quantity cannot be negative');
               }
               if (variant.variantPrice < 0) {
                    throw new AppError(StatusCodes.BAD_REQUEST, 'Variant price cannot be negative');
               }
               return sum + variant.variantQuantity;
          }, 0);

          // Create product data object
          const productData = {
               name: payload.name,
               description: payload.description,
               basePrice: payload.basePrice,
               images: payload.images,
               tags: payload.tags,
               categoryId: payload.categoryId,
               subcategoryId: payload.subcategoryId,
               shopId: payload.shopId,
               brandId: payload.brandId,
               createdBy: user.id,
               totalStock,
               product_variant_Details: resolvedVariants,
               isFeatured: payload.isFeatured || false,
          };

          // Create and save the product
          const product = new Product(productData);
          await product.validate();

          const savedProduct = await product.save({ session });

          await session.commitTransaction();
          return savedProduct;
     } catch (error) {
          await session.abortTransaction();

          // Clean up uploaded files if there was an error
          if (payload.images && Array.isArray(payload.images)) {
               payload.images.forEach((image) => unlinkFile(image));
          }

          throw error;
     } finally {
          await session.endSession();
     }
};

const getProducts = async (query: Record<string, unknown>) => {
     const productQuery = new QueryBuilder(
          Product.find().populate('shopId', 'name').populate('categoryId', 'name').populate('subcategoryId', 'name').populate('brandId', 'name').populate('product_variant_Details.variantId', 'slug'),
          query,
     )
          .search(['name', 'description', 'tags'])
          .filter()
          .sort()
          .paginate()
          .fields();

     const result = await productQuery.modelQuery;
     const meta = await productQuery.countTotal();

     return {
          meta,
          result,
     };
};

const getProductById = async (id: string) => {
     const product = await Product.findById(id)
          .populate('shopId', 'name logo address')
          .populate('categoryId', 'name')
          .populate('subcategoryId', 'name')
          .populate('brandId', 'name')
          .populate('product_variant_Details.variantId');

     if (!product) {
          throw new AppError(StatusCodes.NOT_FOUND, 'Product not found');
     }

     // increase the product view count
     product.viewCount += 1;
     await product.save();

     // increaset he ctgViewCount of the category
     const category = await Category.findById(product.categoryId);
     if (category) {
          category.ctgViewCount += 1;
          await category.save();
     }

     return product;
};

/* v1 */
const updateProduct = async (id: string, payload: Partial<IProduct | ICreateProductRequest | any>, user: IJwtPayload) => {
     const product: any = await Product.findById(id).populate('shopId', 'owner admins').populate('categoryId', 'name').populate('subcategoryId', 'name');

     if (!product) {
          throw new AppError(StatusCodes.NOT_FOUND, 'Product not found');
     }

     const shop = await Shop.findById(product.shopId);
     if (!shop) {
          throw new AppError(StatusCodes.NOT_FOUND, 'Shop not found');
     }

     // Check if user has permission to update the product
     if (user.role === USER_ROLES.VENDOR || user.role === USER_ROLES.SHOP_ADMIN) {
          if (shop.owner.toString() !== user.id && !shop.admins?.some((admin) => admin.toString() === user.id)) {
               throw new AppError(StatusCodes.FORBIDDEN, 'You are not authorized to update this product');
          }
     }

     // Handle variant updates if payload contains product_variant_Details
     if (payload.product_variant_Details && Array.isArray(payload.product_variant_Details)) {
          const variantsToUpdate: IProductSingleVariant[] = [];
          let totalStock = 0;

          for (const variant of payload.product_variant_Details) {
               // Case (i): If variantId is provided
               const isVariantId = 'variantId' in variant;

               if (isVariantId) {
                    // Check if variant exists in the product
                    const existingVariant = product.product_variant_Details.find((v: any) => v.variantId.toString() === variant.variantId.toString());

                    if (!existingVariant) {
                         throw new AppError(StatusCodes.BAD_REQUEST, `Variant with ID ${variant.variantId} not found in product`);
                    }

                    // Update existing variant
                    existingVariant.variantQuantity = variant.variantQuantity;
                    existingVariant.variantPrice = variant.variantPrice;
                    variantsToUpdate.push(existingVariant);
                    totalStock += variant.variantQuantity;
               }
               // Case (ii): If variant fields are provided (without variantId)
               else {
                    // Create slug from variant fields
                    const variantFields = { ...variant };
                    const slug = generateSlug(product.categoryId.name, product.subcategoryId.name, variant as IProductSingleVariantByFieldName);

                    // Find variant by slug
                    let foundVariant = (await Variant.findOne({ slug })) as IVariant;

                    if (!foundVariant) {
                         // If variant doesn't exist, create a new variant
                         const newVariant = new Variant({
                              ...variant,
                              createdBy: user.id,
                              categoryId: product.categoryId,
                              subCategoryId: product.subcategoryId,
                              slug,
                         });

                         foundVariant = await newVariant.save();
                    }

                    // Check if the variant already exists in the product's variants array
                    const existingVariantIndex = product.product_variant_Details.findIndex((v: any) => v.variantId.toString() === foundVariant._id!.toString());

                    if (existingVariantIndex !== -1) {
                         // If the variant exists, only update the quantity and price
                         product.product_variant_Details[existingVariantIndex].variantQuantity = variant.variantQuantity;
                         product.product_variant_Details[existingVariantIndex].variantPrice = variant.variantPrice;
                         variantsToUpdate.push(product.product_variant_Details[existingVariantIndex]);
                    } else {
                         // If the variant doesn't exist, add the new variant
                         const newVariantData: IProductSingleVariant = {
                              variantId: foundVariant._id as unknown as ObjectId,
                              variantQuantity: variant.variantQuantity,
                              variantPrice: variant.variantPrice,
                         };
                         variantsToUpdate.push(newVariantData);
                    }
                    totalStock += variant.variantQuantity;
               }
          }

          // Update product's variant details and total stock
          product.product_variant_Details = variantsToUpdate;
          payload.totalStock = totalStock;
     }

     // Handle image updates if images are provided in the payload
     if (payload.images) {
          product.images = payload.images;
     }

     // Update the product in the database
     const updatedProduct = await Product.findByIdAndUpdate(
          id,
          {
               ...payload,
               ...(payload.product_variant_Details && {
                    product_variant_Details: product.product_variant_Details,
               }),
          },
          { new: true },
     );
     // .populate('product_variant_Details.variantId');

     if (!updatedProduct) {
          throw new AppError(StatusCodes.INTERNAL_SERVER_ERROR, 'Failed to update product');
     }

     // Handle image cleanup if product was not updated successfully
     if (payload.images && !updatedProduct) {
          payload.images.forEach((image: any) => unlinkFile(image));
     }

     return updatedProduct;
};

const deleteProduct = async (id: string, user: IJwtPayload) => {
     const product = await Product.findById(id).populate('shopId', 'owner admins');
     if (!product) {
          throw new AppError(StatusCodes.NOT_FOUND, 'Product not found');
     }
     const shop = await Shop.findById(product.shopId);
     if (!shop) {
          throw new AppError(StatusCodes.NOT_FOUND, 'Shop not found');
     }

     if (user.role === USER_ROLES.VENDOR || user.role === USER_ROLES.SHOP_ADMIN) {
          if (shop.owner.toString() !== user.id && !shop.admins?.some((admin) => admin.toString() === user.id)) {
               throw new AppError(StatusCodes.FORBIDDEN, 'You are not authorized to delete this product');
          }
     }

     // Soft delete the product
     product.isDeleted = true;
     product.deletedAt = new Date();
     await product.save();

     return product;
};

const getProductsByCategory = async (categoryId: string, query: Record<string, unknown>) => {
     const productQuery = new QueryBuilder(
          Product.find({ categoryId })
               .populate('shopId', 'name')
               .populate('categoryId', 'name')
               .populate('subcategoryId', 'name')
               .populate('brandId', 'name')
               .populate('product_variant_Details.variantId', 'slug'),
          query,
     )
          .search(['name', 'description', 'tags'])
          .filter()
          .sort()
          .paginate()
          .fields();

     const result = await productQuery.modelQuery;
     const meta = await productQuery.countTotal();

     return {
          meta,
          result,
     };
};

const updateToggleProductIsRecommended = async (id: string, user: IJwtPayload) => {
     const product = await Product.findById(id).populate('shopId', 'owner admins');
     if (!product) {
          throw new AppError(StatusCodes.NOT_FOUND, 'Product not found');
     }
     const shop = await Shop.findById(product.shopId);
     if (!shop) {
          throw new AppError(StatusCodes.NOT_FOUND, 'Shop not found');
     }

     if (user.role === USER_ROLES.VENDOR || user.role === USER_ROLES.SHOP_ADMIN) {
          if (shop.owner.toString() !== user.id && !shop.admins?.some((admin) => admin.toString() === user.id)) {
               throw new AppError(StatusCodes.FORBIDDEN, 'You are not authorized to create a product for this shop');
          }
     }

     product.isRecommended = !product.isRecommended;
     await product.save();

     return product;
};

const getRecommendedProducts = async (query: Record<string, unknown>) => {
     const productQuery = new QueryBuilder(
          Product.find({ isRecommended: true })
               .populate('shopId', 'name')
               .populate('categoryId', 'name')
               .populate('subcategoryId', 'name')
               .populate('brandId', 'name')
               .populate('product_variant_Details.variantId', 'slug'),
          query,
     )
          .search(['name', 'description', 'tags'])
          .filter()
          .sort()
          .paginate()
          .fields();

     const result = await productQuery.modelQuery;
     const meta = await productQuery.countTotal();

     return {
          meta,
          result,
     };
};

const getProductsByShop = async (shopId: string, query: Record<string, unknown>) => {
     const productQuery = new QueryBuilder(
          Product.find({ shopId })
               .populate('shopId', 'name')
               .populate('categoryId', 'name')
               .populate('subcategoryId', 'name')
               .populate('brandId', 'name')
               .populate('product_variant_Details.variantId', 'slug'),
          query,
     )
          .search(['name', 'description', 'tags'])
          .filter()
          .sort()
          .paginate()
          .fields();

     const result = await productQuery.modelQuery;
     const meta = await productQuery.countTotal();

     return {
          meta,
          result,
     };
};

// Service to get all products of a specific province
const getAllProductsByProvince = async (province: string, query: Record<string, unknown>) => {
     try {
          // Step 1: Find all the shops located in the specified province
          const shopQuery = new QueryBuilder(Shop.find({ 'address.province': province, 'isDeleted': { $ne: true } }), query).search(['name']).filter().sort().paginate().fields();

          const shopsInProvince = await shopQuery.modelQuery;

          if (!shopsInProvince || shopsInProvince.length === 0) {
               throw new AppError(StatusCodes.NOT_FOUND, `No shops found in the province: ${province}`);
          }

          // Step 2: Extract the shopIds from the shops
          const shopIds = shopsInProvince.map((shop) => shop._id);

          // Step 3: Fetch all products that belong to the shops in the given province
          const productQuery = new QueryBuilder(
               Product.find({ shopId: { $in: shopIds }, isDeleted: { $ne: true } })
                    .populate('shopId', 'name')
                    .populate('categoryId', 'name')
                    .populate('subcategoryId', 'name')
                    .populate('brandId', 'name')
                    .populate('product_variant_Details.variantId', 'slug'),
               query,
          )
               .search(['name', 'description', 'tags'])
               .filter()
               .sort()
               .paginate()
               .fields();

          const products = await productQuery.modelQuery;
          const productMeta = await productQuery.countTotal();

          // Step 4: Return the products
          return {
               productMeta,
               products,
          };
     } catch (error) {
          console.error('Error fetching products by province:', error);
          throw error; // Throw the error for further handling
     }
};

// Service to get all products of a specific territory
const getAllProductsByTerritory = async (territory: string, query: Record<string, unknown>) => {
     try {
          // Step 1: Find all the shops located in the specified territory
          const shopQuery = new QueryBuilder(Shop.find({ 'address.territory': territory, 'isDeleted': { $ne: true } }), query).search(['name']).filter().sort().paginate().fields();

          const shopsInProvince = await shopQuery.modelQuery;

          if (!shopsInProvince || shopsInProvince.length === 0) {
               throw new AppError(StatusCodes.NOT_FOUND, `No shops found in the territory: ${territory}`);
          }

          // Step 2: Extract the shopIds from the shops
          const shopIds = shopsInProvince.map((shop) => shop._id);

          // Step 3: Fetch all products that belong to the shops in the given province
          const productQuery = new QueryBuilder(
               Product.find({ shopId: { $in: shopIds }, isDeleted: { $ne: true } })
                    .populate('shopId', 'name')
                    .populate('categoryId', 'name')
                    .populate('subcategoryId', 'name')
                    .populate('brandId', 'name')
                    .populate('product_variant_Details.variantId', 'slug'),
               query,
          )
               .search(['name', 'description', 'tags'])
               .filter()
               .sort()
               .paginate()
               .fields();

          const products = await productQuery.modelQuery;
          const productMeta = await productQuery.countTotal();

          // Step 4: Return the products
          return {
               productMeta,
               products,
          };
     } catch (error) {
          console.error('Error fetching products by territory:', error);
          throw error; // Throw the error for further handling
     }
};

export const ProductService = {
     createProduct,
     getProducts,
     getProductById,
     updateProduct,
     deleteProduct,
     getProductsByCategory,
     updateToggleProductIsRecommended,
     getRecommendedProducts,
     getProductsByShop,
     getAllProductsByProvince,
     getAllProductsByTerritory,
};
