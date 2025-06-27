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
            if (shop.owner.toString() !== user.id && !shop.admins?.some(admin => admin.toString() === user.id)) {
                throw new AppError(StatusCodes.FORBIDDEN, 'You are not authorized to create a product for this shop');
            }
        }

        // Validate category, subcategory, and brand in parallel
        const [isExistCategory, isExistSubCategory, isExistBrand] = await Promise.all([
            Category.findOne({ _id: payload.categoryId }, null, { session }),
            SubCategory.findOne({ _id: payload.subcategoryId, categoryId: payload.categoryId }, null, { session }),
            Brand.findOne({ _id: payload.brandId }, null, { session })
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
                        variantPrice: variant.variantPrice
                    } as IProductSingleVariant;
                }

                // Create a new Variant if variantId is not provided
                const newVariant = new Variant({
                    ...variant,
                    createdBy: user.id,
                    categoryId: payload.categoryId,
                    subCategoryId: payload.subcategoryId,
                });

                const variantSlug = generateSlug(
                    isExistCategory.name,
                    isExistSubCategory.name,
                    variant as IProductSingleVariantByFieldName
                );

                const isVariantExistSlug = await Variant.findOne({ slug: variantSlug }, null, { session });
                if (isVariantExistSlug) {
                    return {
                        variantId: isVariantExistSlug._id,
                        variantQuantity: variant.variantQuantity,
                        variantPrice: variant.variantPrice
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
                    variantPrice: variant.variantPrice
                } as unknown as IProductSingleVariant;
            })
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
            isFeatured: payload.isFeatured || false
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
            payload.images.forEach(image => unlinkFile(image));
        }

        throw error;
    } finally {
        await session.endSession();
    }
};


const getProducts = async (query: Record<string, unknown>) => {
    const productQuery = new QueryBuilder(Product.find().populate('shopId', 'name').populate('categoryId', 'name').populate('subcategoryId', 'name').populate('brandId', 'name').populate('product_variant_Details.variantId', 'slug'), query)
        .search(['name', 'description', 'tags'])
        .filter()
        .sort()
        .paginate()
        .fields();

    const result = await productQuery.modelQuery;
    const meta = await productQuery.countTotal();

    return {
        meta,
        result
    };
};

const getProductById = async (id: string) => {
    const product = await Product.findById(id)
        .populate('shopId', 'name')
        .populate('categoryId', 'name')
        .populate('subcategoryId', 'name')
        .populate('brandId', 'name')
        .populate('product_variant_Details.variantId', 'slug');

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



// const updateProduct = async (id: string, payload: Partial<IProduct | ICreateProductRequest | any>, user: IJwtPayload) => {

//     /**
//      * যদি payload এ product_variant_Details কিংবা images না include করা থাকে তাহলে সিমপ্লি product আপডেট হবে।
//      * যদি payload এ images include করা থাকে তাহলে শুধুমাত্র req.files এর মাধ্যমে পাঠানো images দিয়ে product আপডেট হবে।
//      * যদি payload এ product_variant_Details include করা থাকে তাহলে কয়েক step এ আপডেট হবে,
//      * 1. যদি payload.product_variant_Details এ variantId থাকে তাহলে একরকম (i)
//      * 2. যদি payload.product_variant_Details এ variantField থাকে তাহলে একরকম (ii)
//      *  (i) এর জন্য যদি variantId exist করে product.product_variant_Details+Variant Model তাহলে শুদু পাঠানো variantQuantity+variantPrice এ সেটা আপডেট করবো আর exist না করলে eror throw করব
//      *  (ii) এর জন্য যদি variantField গুলো দিয়ে আগে slug বানাবো আর তারপরে getVariantBySlug করে যদি কোন variant পাই তাহলে আবারো product.product_variant_Details এ check করব সেটা existed কিনা যদি থাকে তাহলে শুদু পাঠানো variantQuantity+variantPrice এ সেটা আপডেট করবো আর না থাকলে নতুন variant create করব আর তারপরে payload.product_variant_Details এ পাঠানো variantQuantity+variantPrice দিয়ে product.product_variant_Details এ add করে product আপডেট করব
//      */
//     // Get existing product with shop owner and admins populated
//     const product = await Product.findById(id).populate('shopId', 'owner admins').populate('categoryId', 'name').populate('subcategoryId', 'name');
//     if (!product) {
//         throw new AppError(StatusCodes.NOT_FOUND, 'Product not found');
//     }

//     const shop = await Shop.findById(product.shopId);
//     if (!shop) {
//         throw new AppError(StatusCodes.NOT_FOUND, 'Shop not found');
//     }

//     // Check if user has permission to update the product
//     if (user.role === USER_ROLES.VENDOR || user.role === USER_ROLES.SHOP_ADMIN) {
//         if (shop.owner.toString() !== user.id && !shop.admins?.some(admin => admin.toString() === user.id)) {
//             throw new AppError(StatusCodes.FORBIDDEN, 'You are not authorized to update this product');
//         }
//     }

//     // Handle variant updates if payload contains product_variant_Details
//     if (payload.product_variant_Details && Array.isArray(payload.product_variant_Details)) {
//         const variantsToUpdate: IProductSingleVariant[] = [];
//         let totalStock = 0;

//         for (const variant of payload.product_variant_Details) {
//             // Case (i): If variantId is provided
//             const isVariantId = 'variantID' in variant;
//             if (isVariantId) {
//                 // Check if variant exists in the product
//                 const existingVariant = product.product_variant_Details.find(
//                     v => v.variantId.toString() === variant.variantId.toString()
//                 );

//                 if (!existingVariant) {
//                     throw new AppError(StatusCodes.BAD_REQUEST, `Variant with ID ${variant.variantId} not found in product`);
//                 }

//                 // Update existing variant
//                 existingVariant.variantQuantity = variant.variantQuantity;
//                 existingVariant.variantPrice = variant.variantPrice;
//                 variantsToUpdate.push(existingVariant);
//                 totalStock += variant.variantQuantity;
//             }
//             // Case (ii): If variant fields are provided
//             else if (isVariantId === false) {
//                 // Create slug from variant fields
//                 const variantFields = { ...variant };
//                 // delete variantFields.variantQuantity;
//                 // delete variantFields.variantPrice;

//                 // Create a new Variant if variantId is not provided
//                 const newVariant = new Variant({
//                     ...variant,
//                     createdBy: user.id,
//                     categoryId: product.categoryId,
//                     subCategoryId: product.subcategoryId,
//                 });

//                 const slug = generateSlug(
//                     product.categoryId.name,
//                     product.subcategoryId.name,
//                     variant as IProductSingleVariantByFieldName
//                 );


//                 // Find variant by slug
//                 let foundVariant = await Variant.findOne({ slug }) as IVariant;

//                 if (!foundVariant) {
//                     newVariant.slug = slug;
//                     foundVariant = await newVariant.save();
//                 }

//                 // Check if variant already exists in product
//                 const existingVariantInProductIndex = product.product_variant_Details.findIndex(
//                     v => v.variantId.toString() === foundVariant._id!.toString()
//                 );

//                 if (existingVariantInProductIndex !== -1) {
//                     // Update existing variant
//                     product.product_variant_Details[existingVariantInProductIndex].variantQuantity = variant.variantQuantity;
//                     product.product_variant_Details[existingVariantInProductIndex].variantPrice = variant.variantPrice;
//                     variantsToUpdate.push(product.product_variant_Details[existingVariantInProductIndex]);
//                 } else {
//                     // Add new variant
//                     const newVariant: IProductSingleVariant = {
//                         variantId: foundVariant._id as unknown as ObjectId,
//                         variantQuantity: variant.variantQuantity,
//                         variantPrice: variant.variantPrice
//                     };
//                     variantsToUpdate.push(newVariant);
//                 }
//                 totalStock += variant.variantQuantity;
//             }
//         }

//         // Update product's variant details and total stock
//         product.product_variant_Details = variantsToUpdate;
//         payload.totalStock = totalStock;
//     }

//     // Update product by sunig save
//     // const updatedProduct = await product.save();


//     // Update product
//     const updatedProduct = await Product.findByIdAndUpdate(
//         id,
//         {
//             ...payload,
//             ...(payload.product_variant_Details && {
//                 product_variant_Details: product.product_variant_Details
//             })
//         },
//         { new: true }
//     ).populate('product_variant_Details.variantId');

//     if (!updatedProduct) {
//         throw new AppError(StatusCodes.INTERNAL_SERVER_ERROR, 'Failed to update product');
//     }

//     // Handle image cleanup if product was not updated successfully
//     if (payload.images && !updatedProduct) {
//         payload.images.forEach((image: any) => unlinkFile(image));
//     }

//     return updatedProduct;
// };


const updateProduct = async (
    id: string,
    payload: Partial<IProduct | ICreateProductRequest | any>,
    user: IJwtPayload
) => {
    const product = await Product.findById(id)
        .populate('shopId', 'owner admins')
        .populate('categoryId', 'name')
        .populate('subcategoryId', 'name');

    if (!product) {
        throw new AppError(StatusCodes.NOT_FOUND, 'Product not found');
    }

    const shop = await Shop.findById(product.shopId);
    if (!shop) {
        throw new AppError(StatusCodes.NOT_FOUND, 'Shop not found');
    }

    // Check if user has permission to update the product
    if (user.role === USER_ROLES.VENDOR || user.role === USER_ROLES.SHOP_ADMIN) {
        if (shop.owner.toString() !== user.id && !shop.admins?.some(admin => admin.toString() === user.id)) {
            throw new AppError(StatusCodes.FORBIDDEN, 'You are not authorized to update this product');
        }
    }

    // Handle variant updates if payload contains product_variant_Details
    if (payload.product_variant_Details && Array.isArray(payload.product_variant_Details)) {
        const variantsToUpdate: IProductSingleVariant[] = [];
        let totalStock = 0;

        for (const variant of payload.product_variant_Details) {
            // Check if variant has variant fields and create the slug
            const variantFields = { ...variant };
            const slug = generateSlug(
                product.categoryId.name,
                product.subcategoryId.name,
                variant as IProductSingleVariantByFieldName
            );

            // Find variant by slug
            let foundVariant = await Variant.findOne({ slug }) as IVariant;

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
            const existingVariantIndex = product.product_variant_Details.findIndex(
                v => v.variantId.toString() === foundVariant._id!.toString()
            );

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
                    variantPrice: variant.variantPrice
                };
                variantsToUpdate.push(newVariantData);
            }

            totalStock += variant.variantQuantity;
        }

        // Update product's variant details and total stock
        product.product_variant_Details = variantsToUpdate;
        console.log(product.product_variant_Details);
        payload.totalStock = totalStock;
    }

    // Update the product in the database
    const updatedProduct = await Product.findByIdAndUpdate(
        id,
        {
            ...payload,
            ...(payload.product_variant_Details && {
                product_variant_Details: product.product_variant_Details
            })
        },
        { new: true }
    )
        .populate('product_variant_Details.variantId');

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
        if (shop.owner.toString() !== user.id && !shop.admins?.some(admin => admin.toString() === user.id)) {
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
    const productQuery = new QueryBuilder(Product.find({ categoryId })
        .populate('shopId', 'name')
        .populate('categoryId', 'name')
        .populate('subcategoryId', 'name')
        .populate('brandId', 'name')
        .populate('product_variant_Details.variantId', 'slug'), query)
        .search(['name', 'description', 'tags'])
        .filter()
        .sort()
        .paginate()
        .fields();

    const result = await productQuery.modelQuery;
    const meta = await productQuery.countTotal();

    return {
        meta,
        result
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
        if (shop.owner.toString() !== user.id && !shop.admins?.some(admin => admin.toString() === user.id)) {
            throw new AppError(StatusCodes.FORBIDDEN, 'You are not authorized to create a product for this shop');
        }
    }

    product.isRecommended = !product.isRecommended;
    await product.save();

    return product;
};

const getRecommendedProducts = async (query: Record<string, unknown>) => {
    const productQuery = new QueryBuilder(Product.find({ isRecommended: true }).populate('shopId', 'name').populate('categoryId', 'name').populate('subcategoryId', 'name').populate('brandId', 'name').populate('product_variant_Details.variantId', 'slug'), query)
        .search(['name', 'description', 'tags'])
        .filter()
        .sort()
        .paginate()
        .fields();

    const result = await productQuery.modelQuery;
    const meta = await productQuery.countTotal();

    return {
        meta,
        result
    };
};

const getProductsByShop = async (shopId: string, query: Record<string, unknown>) => {
    const productQuery = new QueryBuilder(Product.find({ shopId }).populate('shopId', 'name').populate('categoryId', 'name').populate('subcategoryId', 'name').populate('brandId', 'name').populate('product_variant_Details.variantId', 'slug'), query)
        .search(['name', 'description', 'tags'])
        .filter()
        .sort()
        .paginate()
        .fields();

    const result = await productQuery.modelQuery;
    const meta = await productQuery.countTotal();

    return {
        meta,
        result
    };
};

// const addNewVariantToProductByVariantFieldName = async (productId: string, data: IProductSingleVariantByFieldName, user: IJwtPayload) => {
//     const product = await Product.findById(productId).populate('categoryId', 'name').populate('subcategoryId', 'name');

//     if (!product) {
//         throw new AppError(StatusCodes.BAD_REQUEST, 'Product not found');
//     }

//     const shop = await Shop.findById(product.shopId);
//     if (!shop) {
//         throw new AppError(StatusCodes.NOT_FOUND, 'Shop not found');
//     }


//     if (user.role === USER_ROLES.VENDOR || user.role === USER_ROLES.SHOP_ADMIN) {
//         if (shop.owner.toString() !== user.id && !shop.admins?.some(admin => admin.toString() === user.id)) {
//             throw new AppError(StatusCodes.FORBIDDEN, 'You are not authorized to delete this product');
//         }
//     }

//     const variantSlug = generateSlug(
//         product.categoryId.name,
//         product.subcategoryId.name,
//         data
//     );

//     const isVariantExistSlug = await Variant.findOne({ slug: variantSlug }, null, { session });
//     if (isVariantExistSlug) {
//         throw new AppError(StatusCodes.BAD_REQUEST, 'Variant already exists');
//     }

//     const variant = await Variant.findOne({ slug: variantSlug });

//     if (!variant) {
//         throw new AppError(StatusCodes.BAD_REQUEST, 'Variant not found');
//     }

//     const productVariant = await Product.findOne({
//         _id: productId,
//         'product_variant_Details.variantSlug': data.variantSlug,
//     });

//     if (productVariant) {
//         throw new AppError(StatusCodes.BAD_REQUEST, 'Variant already exists in product');
//     }

//     const newVariant: IProductSingleVariant = {
//         variantId: variant._id.toString(),
//         variantQuantity: data.variantQuantity,
//         variantPrice: data.variantPrice,
//     };

//     product.product_variant_Details.push(newVariant);

//     await product.save();

//     return product;
// };

// const updateProductVariantByVariantFieldName = async (productId: string, data: IProductSingleVariantByFieldName, user: IJwtPayload) => {
//     const product = await Product.findById(productId);

//     if (!product) {
//         throw new AppError(StatusCodes.BAD_REQUEST, 'Product not found');
//     }

//     if (user.role === USER_ROLES.USER) {
//         throw new AppError(StatusCodes.UNAUTHORIZED, 'You are not allowed to perform this action');
//     }

//     const variant = await Variant.findOne({ slug: data.variantSlug });

//     if (!variant) {
//         throw new AppError(StatusCodes.BAD_REQUEST, 'Variant not found');
//     }

//     const productVariant = await Product.findOne({
//         _id: productId,
//         'product_variant_Details.variantSlug': data.variantSlug,
//     });

//     if (!productVariant) {
//         throw new AppError(StatusCodes.BAD_REQUEST, 'Variant does not exist in product');
//     }

//     productVariant.product_variant_Details = productVariant.product_variant_Details.map((variant) => {
//         if (variant.variantSlug === data.variantSlug) {
//             return {
//                 variantId: variant.variantId,
//                 variantQuantity: data.variantQuantity,
//                 variantPrice: data.variantPrice,
//             };
//         }

//         return variant;
//     });

//     await productVariant.save();

//     return productVariant;
// };

// const deleteProductVariantByVariantFieldName = async (productId: string, data: IProductSingleVariantByFieldName, user: IJwtPayload) => {
//     const product = await Product.findById(productId);

//     if (!product) {
//         throw new AppError(StatusCodes.BAD_REQUEST, 'Product not found');
//     }

//     if (user.role === USER_ROLES.USER) {
//         throw new AppError(StatusCodes.UNAUTHORIZED, 'You are not allowed to perform this action');
//     }

//     const variant = await Variant.findOne({ slug: data.variantSlug });

//     if (!variant) {
//         throw new AppError(StatusCodes.BAD_REQUEST, 'Variant not found');
//     }

//     const productVariant = await Product.findOne({
//         _id: productId,
//         'product_variant_Details.variantSlug': data.variantSlug,
//     });

//     if (!productVariant) {
//         throw new AppError(StatusCodes.BAD_REQUEST, 'Variant does not exist in product');
//     }

//     productVariant.product_variant_Details = productVariant.product_variant_Details.filter(
//         (variant) => variant.variantSlug !== data.variantSlug
//     );

//     await productVariant.save();

//     return productVariant;
// };


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
    // addNewVariantToProductByVariantFieldName,
    // updateProductVariantByVariantFieldName,
    // deleteProductVariantByVariantFieldName,
};
