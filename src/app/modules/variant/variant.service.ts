import { StatusCodes } from "http-status-codes";
import AppError from "../../../errors/AppError";
import { Category } from "../category/category.model";
import { SubCategory } from "../subCategorys/subCategory.model";
import Variant from "./variant.model";
import { generateSlug } from "./variant.utils";
import { IVariant } from "./variant.interfaces";
import QueryBuilder from "../../builder/QueryBuilder";
import mongoose from "mongoose";
import { Product } from "../product/product.model";
import { IJwtPayload } from "../auth/auth.interface";
import { USER_ROLES } from "../user/user.enums";


// create sub category
const createVariant = async (payload: IVariant, user: IJwtPayload) => {
    const session = await mongoose.startSession(); // Start a session

    try {
        // Start a transaction
        session.startTransaction();

        // Validate Category
        const isExistCategory = await Category.findById(payload.categoryId).session(session);  // Use session for transaction
        if (!isExistCategory) {
            throw new AppError(StatusCodes.NOT_FOUND, 'Category not found!');
        }

        // Validate SubCategory
        const isExistSubCategory = await SubCategory.findById(payload.subCategoryId).session(session);  // Use session for transaction
        if (!isExistSubCategory) {
            throw new AppError(StatusCodes.NOT_FOUND, 'SubCategory not found!');
        }

        // Create a new Variant
        const createVariant = new Variant({
            ...payload,
            createdBy: user.id
        });

        // Generate slug
        const variantSlug = generateSlug(isExistCategory.name, isExistSubCategory.name, payload);

        // Check if variant with same slug already exists
        const isVariantExistSlug = await Variant.findOne({ slug: variantSlug }).session(session); // Use session for transaction
        if (isVariantExistSlug) {
            throw new AppError(StatusCodes.NOT_ACCEPTABLE, `This ${variantSlug} Variant Already Exists under ${isExistSubCategory.name} subcategory`);
        }

        // Set the generated slug
        createVariant.slug = variantSlug;

        // Save the variant to the database
        await createVariant.save({ session });  // Use session for transaction
        if (!createVariant) {
            throw new AppError(StatusCodes.BAD_REQUEST, 'Failed to create Variant');
        }

        // Add the new variant to the subcategory
        await SubCategory.findByIdAndUpdate(
            payload.subCategoryId,
            {
                $push: { variants: createVariant._id },
            },
            { new: true, session }  // Use session for transaction
        );

        // Commit the transaction
        await session.commitTransaction();

        // End the session
        session.endSession();

        return createVariant;
    } catch (error) {
        // Abort the transaction on error
        await session.abortTransaction();
        session.endSession();

        // Rethrow the error
        throw error;
    }
};

export const getAllVariantsFromDB = async (query: Record<string, unknown>) => {
    const variantQuery = new QueryBuilder(Variant.find().populate([
        { path: "categoryId", select: "name" },  // Only populate the "name" field of categoryId
        { path: "subCategoryId", select: "name" } // Only populate the "name" field of subCategoryId
    ]), query)
    const result = await variantQuery.fields().sort().paginate().filter().search(['slug']).modelQuery
    const meta = await variantQuery.countTotal();
    return {
        meta,
        result
    }
};


export const getSingleVariantByIdFromDB = async (id: string) => {
    const result = await Variant.findById(id).populate([
        { path: "categoryId", select: "name" },  // Only populate the "name" field of categoryId
        { path: "subCategoryId", select: "name" } // Only populate the "name" field of subCategoryId
    ])
    // If no variant was found, throw an error
    if (!result) {
        throw new AppError(StatusCodes.NOT_FOUND, 'Variant not found');
    }
    return {
        result
    }
};


export const getSingleVariantBySlugFromDB = async (slug: string) => {
    const result = await Variant.findOne({ slug }).populate([
        { path: "categoryId", select: "name" },  // Only populate the "name" field of categoryId
        { path: "subCategoryId", select: "name" } // Only populate the "name" field of subCategoryId
    ])

    // If no variant was found, throw an error
    if (!result) {
        throw new AppError(StatusCodes.NOT_FOUND, 'Variant not found');
    }
    return {
        result
    }
};


// Update Variant
export const updateVariant = async (id: string, data: Partial<IVariant>, user: IJwtPayload) => {
    const isExistCategory = await Category.findById(data.categoryId);
    if (!isExistCategory) {
        throw new AppError(StatusCodes.NOT_FOUND, 'Category not found!');
    }
    const isExistSubCategory = await SubCategory.findById(data.subCategoryId);
    if (!isExistSubCategory) {
        throw new AppError(StatusCodes.NOT_FOUND, 'SubCategory not found!');
    }
    // Find and update the variant
    const updatedVariant = await Variant.findOne({ _id: id, categoryId: data.categoryId, subCategoryId: data.subCategoryId })
        .populate({ path: "categoryId", select: "name" })  // Populate categoryId's name field
        .populate({ path: "subCategoryId", select: "name" }); // Populate subCategoryId's name field
    // If no variant was found, throw an error
    if (!updatedVariant) {
        throw new AppError(StatusCodes.NOT_FOUND, 'Variant not found');
    }

    if (
        user.role === USER_ROLES.SHOP_ADMIN || user.role === USER_ROLES.VENDOR &&
        updatedVariant.createdBy.toString() !== user.id
    ) {
        throw new AppError(
            StatusCodes.BAD_REQUEST,
            'You are not able to delete the Variant!'
        );
    }

    // Update the variant with the new slug and the provided data
    updatedVariant.set({
        ...data,  // Apply the incoming data
    });
    const variantSlug = generateSlug(isExistCategory.name, isExistSubCategory.name, updatedVariant)

    const isVariantExistSlug = await Variant.findOne({ slug: variantSlug });
    if (isVariantExistSlug) {
        throw new AppError(StatusCodes.NOT_ACCEPTABLE, `This Variant Already Exists under ${isExistSubCategory.name} subcategory`);
    }
    updatedVariant.set({
        slug: variantSlug
    });
    // Save the updated variant
    await updatedVariant.save();


    return updatedVariant;
};

// Delete Variant
export const deleteVariant = async (id: string, user: IJwtPayload) => {
    // Find and delete the variant
    const deletedVariant = await Variant.findById(id);
    // If no variant was found, throw an error
    if (!deletedVariant) {
        throw new AppError(StatusCodes.NOT_FOUND, 'Variant not found');
    }

    if (
        user.role === USER_ROLES.SHOP_ADMIN || user.role === USER_ROLES.VENDOR &&
        deletedVariant.createdBy.toString() !== user.id
    ) {
        throw new AppError(
            StatusCodes.BAD_REQUEST,
            'You are not able to delete the brand!'
        );
    }
    // Check if the variant is related to any product by variantId
    const product = await Product.findOne({ "product_variant_Details.variantId": id });
    if (product) {
        throw new AppError(StatusCodes.BAD_REQUEST, "You cannot delete the variant because it is associated with a product.");
    }

    deletedVariant.set({
        isDeleted: true
    });
    await deletedVariant.save();

    return deletedVariant;
};


export const getVariantsBySubCategoryIdFromDB = async (id: string, query: Record<string, unknown>) => {

    const variantQuery = new QueryBuilder(Variant.find({ subCategoryId: id }).populate([
        { path: "categoryId", select: "name" },  // Only populate the "name" field of categoryId
        { path: "subCategoryId", select: "name" } // Only populate the "name" field of subCategoryId
    ]), query)
    const result = await variantQuery.fields().sort().paginate().filter().search(['slug']).modelQuery
    // handle case where no variants are found throw error
    if (result.length === 0) {
        throw new AppError(StatusCodes.NOT_FOUND, 'No variants found for this subcategory');
    }
    const meta = await variantQuery.countTotal();
    return {
        meta,
        result
    }
};


export const getVariantFieldsBySubCategoryIdFromDB = async (id: string, query: Record<string, unknown>) => {
    const variantQuery = new QueryBuilder(Variant.find({ subCategoryId: id }), query);

    const result = await variantQuery.fields().sort().paginate().filter().search(['slug']).modelQuery;

    // handle case where no variants are found throw error
    if (result.length === 0) {
        throw new AppError(StatusCodes.NOT_FOUND, 'No variants found for this subcategory');
    }

    // Extract unique field names from the result
    const variantFields = [...new Set(result.flatMap(variant => Object.keys(variant)))];

    // Return the response with the unique field names
    const meta = await variantQuery.countTotal();

    return {
        meta,
        variant_fields: variantFields,
        // result,
    };
};


export const VariantService = {
    createVariant,
    getAllVariantsFromDB,
    getSingleVariantByIdFromDB,
    getSingleVariantBySlugFromDB,
    updateVariant,
    deleteVariant,
    getVariantsBySubCategoryIdFromDB,
    getVariantFieldsBySubCategoryIdFromDB
}