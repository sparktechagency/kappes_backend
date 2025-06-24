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
                    } as IProductSingleVariant;
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
                } as IProductSingleVariant;
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

    return product;
};

const updateProduct = async (id: string, payload: Partial<IProduct>, user: IJwtPayload) => {
    // Get existing product
    const product = await Product.findById(id);
    if (!product) {
        throw new AppError(StatusCodes.NOT_FOUND, 'Product not found');
    }

    // Check if user is authorized to update
    if (product.shopId.toString() !== user.id) {
        throw new AppError(StatusCodes.FORBIDDEN, 'You are not authorized to update this product');
    }

    // Handle variant updates
    if (payload.product_variant_Details) {
        if (!payload.product_variant_Details.length) {
            throw new AppError(StatusCodes.BAD_REQUEST, 'At least one variant is required');
        }

        // Validate variant quantities and prices
        const totalStock = payload.product_variant_Details.reduce((sum, variant) => {
            if (variant.variantQuantity < 0) {
                throw new AppError(StatusCodes.BAD_REQUEST, 'Variant quantity cannot be negative');
            }
            if (variant.variantPrice < 0) {
                throw new AppError(StatusCodes.BAD_REQUEST, 'Variant price cannot be negative');
            }
            return sum + variant.variantQuantity;
        }, 0);

        if (payload.totalStock && totalStock !== payload.totalStock) {
            throw new AppError(StatusCodes.BAD_REQUEST, 'Total stock does not match sum of variant quantities');
        }
    }

    // Update product
    const updatedProduct = await Product.findByIdAndUpdate(
        id,
        payload,
        { new: true }
    );

    if (!updatedProduct) {
        throw new AppError(StatusCodes.INTERNAL_SERVER_ERROR, 'Failed to update product');
    }

    // Handle image cleanup if product was not updated successfully
    if (payload.images && !updatedProduct) {
        payload.images.forEach(image => unlinkFile(image));
    }

    return updatedProduct;
};

const deleteProduct = async (id: string, user: IJwtPayload) => {
    const product = await Product.findById(id).populate('shopId', 'owner');
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
    const product = await Product.findById(id);
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

export const ProductService = {
    createProduct,
    getProducts,
    getProductById,
    updateProduct,
    deleteProduct,
    getProductsByCategory,
    updateToggleProductIsRecommended,
    getRecommendedProducts
};
