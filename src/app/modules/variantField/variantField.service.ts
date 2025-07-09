import { IVariantField, ISingleVariantField } from './variantField.interface';
import { VariantField } from './variantField.model';
import { defaultVariantFields } from './variantField.constants';
import AppError from '../../../errors/AppError';
import { StatusCodes } from 'http-status-codes';
import { Types } from 'mongoose';
import { VARIANT_OPTIONS } from '../variant/variant.enums';

// Get variant fields
export const getVariantField = async (): Promise<IVariantField> => {
  const variantField = await VariantField.findOne({}).lean();
  
  if (!variantField) {
    // If no variant fields exist, seed them with default values
    const newVariantField = await VariantField.create(defaultVariantFields);
    return newVariantField.toObject();
  }
  
  return variantField;
};

// Update variant fields
export const updateVariantField = async (
  payload: Partial<IVariantField>
): Promise<IVariantField> => {
  // Ensure we're only updating valid fields
  const updatePayload: Partial<IVariantField> = {};
  const validFields = Object.keys(defaultVariantFields);
  
  // Only include fields that exist in defaultVariantFields
  Object.keys(payload).forEach(key => {
    if (validFields.includes(key)) {
      // @ts-ignore - We know the key is valid here
      updatePayload[key] = payload[key];
    }
  });
  
  const result = await VariantField.findOneAndUpdate(
    {},
    { $set: updatePayload },
    { new: true, runValidators: true, upsert: true }
  ).lean();
  
  if (!result) {
    throw new AppError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      'Failed to update variant fields'
    );
  }
  
  return result;
};

// Get specific variant field by name with pagination
export const getVariantFieldByName = async (
  fieldName: keyof IVariantField,
  paginationOptions: { page: number; limit: number; } = { page: 1, limit: 10 }
): Promise<{
  data: ISingleVariantField[] | VARIANT_OPTIONS[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
} | null> => {
  // Get the variant field with only the requested field
  const variantField = await VariantField.findOne(
    {},
    { [fieldName]: 1, _id: 0 }
  ).lean();
  
  if (!variantField || !variantField[fieldName]) {
    return null;
  }
  
  // Handle options field (array of VARIANT_OPTIONS)
  if (fieldName === 'options') {
    const options = variantField.options as VARIANT_OPTIONS[];
    const total = options.length;
    const { page, limit } = paginationOptions;
    const skip = (page - 1) * limit;
    
    // Apply pagination
    const paginatedData = options.slice(skip, skip + limit);
    const totalPages = Math.ceil(total / limit);
    
    return {
      data: paginatedData,
      meta: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  }
  
  // Handle other fields (array of ISingleVariantField)
  const fieldValues = variantField[fieldName] as ISingleVariantField[];
  const total = fieldValues.length;
  const { page, limit } = paginationOptions;
  const skip = (page - 1) * limit;
  
  // Apply pagination
  const paginatedData = fieldValues.slice(skip, skip + limit);
  const totalPages = Math.ceil(total / limit);
  
  return {
    data: paginatedData,
    meta: {
      page,
      limit,
      total,
      totalPages,
    },
  };
};

// Get paginated items for a specific field
const getFieldItems = async (
  fieldName: keyof IVariantField,
  paginationOptions: { page: number; limit: number; } = { page: 1, limit: 10 }
) => {
  const { page, limit } = paginationOptions;
  const skip = (page - 1) * limit;
  
  // Handle special case for 'options' field which is an array of VARIANT_OPTIONS
  if (fieldName === 'options') {
    const variantField = await VariantField.findOne({}).lean();
    if (!variantField || !variantField.options) {
      return {
        data: [],
        meta: {
          page,
          limit,
          total: 0,
          totalPages: 0,
        },
      };
    }
    
    const options = variantField.options as VARIANT_OPTIONS[];
    const paginatedOptions = options
      .slice(skip, skip + limit)
      .map(opt => ({
        _id: opt, // Using the option value as ID for consistency
        name: opt,
        code: opt // Adding code for consistency with other fields
      }));
    
    return {
      data: paginatedOptions as unknown as ISingleVariantField[],
      meta: {
        page,
        limit,
        total: options.length,
        totalPages: Math.ceil(options.length / limit),
      },
    };
  }
  
  // For other fields (array of ISingleVariantField)
  const result = await VariantField.aggregate([
    { $project: { [fieldName]: 1, _id: 0 } },
    { $unwind: `$${fieldName}` },
    {
      $facet: {
        data: [
          { $skip: skip },
          { $limit: limit },
          { $replaceRoot: { newRoot: `$${fieldName}` } }
        ],
        total: [
          { $count: 'count' }
        ]
      }
    }
  ]);
  
  const total = result[0]?.total[0]?.count || 0;
  const totalPages = Math.ceil(total / limit);
  
  return {
    data: (result[0]?.data || []) as ISingleVariantField[],
    meta: {
      page,
      limit,
      total,
      totalPages,
    },
  };
};

// Get a specific field item by ID
const getFieldItemById = async (
  fieldName: keyof IVariantField,
  id: string
): Promise<ISingleVariantField | VARIANT_OPTIONS | null> => {
  // Handle special case for 'options' field which is an array of VARIANT_OPTIONS
  if (fieldName === 'options') {
    const variantField = await VariantField.findOne({}).lean();
    if (!variantField || !variantField.options) {
      return null;
    }
    
    // Find the option by value (since options is an array of strings/enums)
    const option = variantField.options.find(opt => opt === id as VARIANT_OPTIONS);
    return option || null;
  }
  
  // For other fields (array of ISingleVariantField)
  const result = await VariantField.aggregate([
    { $project: { [fieldName]: 1, _id: 0 } },
    { $unwind: `$${fieldName}` },
    { $match: { [`${fieldName}._id`]: new Types.ObjectId(id) } },
    { $replaceRoot: { newRoot: `$${fieldName}` } }
  ]);
  
  // Ensure we return null if no result, or the result with the correct type
  const item = result[0];
  if (!item) {
    return null;
  }
  
  // Ensure the item has the correct shape
  if (typeof item === 'object' && item !== null && 'name' in item) {
    return item as ISingleVariantField;
  }
  
  return null;
};

// Add a new item to a field
const addFieldItem = async (
  fieldName: keyof IVariantField,
  itemData: Omit<ISingleVariantField, '_id'>
): Promise<ISingleVariantField> => {
  // Handle special case for 'options' field which is an array of VARIANT_OPTIONS
  if (fieldName === 'options') {
    const variantField = await VariantField.findOne({});
    if (!variantField) {
      throw new AppError(StatusCodes.NOT_FOUND, 'Variant field document not found');
    }
    
    // For options, we just add the string value
    if (!variantField.options) {
      variantField.options = [];
    }
    
    // Check if option already exists
    const optionExists = variantField.options.some(
      (opt: VARIANT_OPTIONS) => opt === itemData.name as VARIANT_OPTIONS
    );
    
    if (optionExists) {
      throw new AppError(StatusCodes.CONFLICT, 'Option already exists');
    }
    
    // Add the new option
    variantField.options.push(itemData.name as VARIANT_OPTIONS);
    await variantField.save();
    
    // For options field, we return a simplified object
    return { 
      _id: new Types.ObjectId().toHexString(),
      name: itemData.name,
      code: itemData.code
    } as ISingleVariantField;
  }
  
  // For other fields, add the full object
  const newItem = {
    _id: new Types.ObjectId(),
    ...itemData
  };
  
  const result = await VariantField.findOneAndUpdate(
    {},
    { $push: { [fieldName]: newItem } },
    { new: true, upsert: true }
  );
  
  if (!result) {
    throw new AppError(StatusCodes.INTERNAL_SERVER_ERROR, 'Failed to add field item');
  }
  
  // Find and return the newly added item
  const fieldItems = result[fieldName as keyof IVariantField];
  if (!Array.isArray(fieldItems)) {
    throw new AppError(StatusCodes.INTERNAL_SERVER_ERROR, 'Invalid field items format');
  }
  
  const addedItem = fieldItems.find(
    (item: any) => item.name === itemData.name
  ) as ISingleVariantField | undefined;
  
  if (!addedItem) {
    throw new AppError(StatusCodes.INTERNAL_SERVER_ERROR, 'Failed to retrieve added item');
  }
  
  return addedItem;
};

// Update a field item
const updateFieldItem = async (
  fieldName: keyof IVariantField,
  id: string,
  updateData: Partial<ISingleVariantField>
): Promise<ISingleVariantField | null> => {
  // Handle special case for 'options' field which is an array of VARIANT_OPTIONS
  if (fieldName === 'options') {
    if (!updateData.name) {
      throw new AppError(
        StatusCodes.BAD_REQUEST,
        'Name is required for updating an option'
      );
    }
    
    const variantField = await VariantField.findOne({});
    if (!variantField || !variantField.options) {
      return null;
    }
    
    const optionIndex = variantField.options.findIndex(
      (opt: VARIANT_OPTIONS) => opt === id as VARIANT_OPTIONS
    );
    
    if (optionIndex === -1) {
      return null;
    }
    
    // Update the option
    variantField.options[optionIndex] = updateData.name as VARIANT_OPTIONS;
    await variantField.save();
    
    // Return the updated option as ISingleVariantField
    return { 
      _id: id,
      name: variantField.options[optionIndex] 
    } as ISingleVariantField;
  }
  
  // For other fields (array of ISingleVariantField)
  const updateObj: Record<string, any> = {};
  
  // Build the update object dynamically based on provided fields
  Object.entries(updateData).forEach(([key, value]) => {
    if (value !== undefined) {
      updateObj[`${fieldName}.$.${key}`] = value;
    }
  });
  
  if (Object.keys(updateObj).length === 0) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      'No valid fields provided for update'
    );
  }
  
  const result = await VariantField.findOneAndUpdate(
    { [`${fieldName}._id`]: new Types.ObjectId(id) },
    { $set: updateObj },
    { new: true }
  );
  
  if (!result) {
    return null;
  }
  
  // Return the updated item
  const fieldItems = result[fieldName as keyof IVariantField];
  if (!Array.isArray(fieldItems)) {
    return null;
  }
  
  const updatedItem = fieldItems.find(
    (item: any) => item._id?.toString() === id
  ) as ISingleVariantField | undefined;

  return updatedItem || null;
};

// Delete a field item
const deleteFieldItem = async (
  fieldName: keyof IVariantField,
  id: string
): Promise<ISingleVariantField | null> => {
  // Handle special case for 'options' field
  if (fieldName === 'options') {
    const variantField = await VariantField.findOne({});
    if (!variantField || !variantField.options) {
      return null;
    }

    const optionIndex = variantField.options.findIndex(
      (opt: VARIANT_OPTIONS) => opt === id as VARIANT_OPTIONS
    );
    
    if (optionIndex === -1) {
      return null;
    }
    
    const deletedOption = variantField.options[optionIndex];
    variantField.options.splice(optionIndex, 1);
    
    await variantField.save();
    
    // Convert VARIANT_OPTIONS to ISingleVariantField
    return { 
      _id: id,
      name: deletedOption
    } as ISingleVariantField;
  }
  
  // For other fields
  // First get the item to return it later
  const item = await getFieldItemById(fieldName, id);
  
  if (!item || typeof item !== 'object' || !('_id' in item)) {
    return null;
  }
  
  // Remove the item from the array
  const result = await VariantField.updateOne(
    {},
    { $pull: { [fieldName]: { _id: new Types.ObjectId(id) } } }
  );
  
  if (result.modifiedCount === 0) {
    return null;
  }
  
  return item as ISingleVariantField;
};

// Define the service interface
type VariantFieldServiceType = {
  getVariantField: () => Promise<IVariantField>;
  updateVariantField: (payload: Partial<IVariantField>) => Promise<IVariantField>;
  getVariantFieldByName: (
    fieldName: keyof IVariantField,
    paginationOptions?: { page: number; limit: number; }
  ) => Promise<{
    data: ISingleVariantField[] | VARIANT_OPTIONS[];
    meta: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  } | null>;
  getFieldItems: (
    fieldName: keyof IVariantField,
    paginationOptions?: { page: number; limit: number; }
  ) => Promise<{
    data: ISingleVariantField[];
    meta: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }>;
  getFieldItemById: (
    fieldName: keyof IVariantField,
    id: string
  ) => Promise<ISingleVariantField | VARIANT_OPTIONS | null>;
  addFieldItem: (
    fieldName: keyof IVariantField,
    itemData: Omit<ISingleVariantField, '_id'>
  ) => Promise<ISingleVariantField>;
  updateFieldItem: (
    fieldName: keyof IVariantField,
    id: string,
    updateData: Partial<ISingleVariantField>
  ) => Promise<ISingleVariantField | null>;
  deleteFieldItem: (
    fieldName: keyof IVariantField,
    id: string
  ) => Promise<ISingleVariantField | null>;
};

export const VariantFieldService: VariantFieldServiceType = {
  getVariantField,
  updateVariantField,
  getVariantFieldByName,
  getFieldItems,
  getFieldItemById,
  addFieldItem,
  updateFieldItem,
  deleteFieldItem,
};
