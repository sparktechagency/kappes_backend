import { Schema, model } from 'mongoose';
import { IVariantField, ISingleVariantField } from './variantField.interface';

const singleVariantFieldSchema = new Schema<ISingleVariantField>(
  {
    name: { type: String, required: true },
    code: { type: String },
  }
);

const variantFieldSchema = new Schema<IVariantField>(
  {
    color: [singleVariantFieldSchema],
    storage: [singleVariantFieldSchema],
    ram: [singleVariantFieldSchema],
    network_type: [singleVariantFieldSchema],
    operating_system: [singleVariantFieldSchema],
    storage_type: [singleVariantFieldSchema],
    processor_type: [singleVariantFieldSchema],
    processor: [singleVariantFieldSchema],
    graphics_card_type: [singleVariantFieldSchema],
    graphics_card_size: [singleVariantFieldSchema],
    screen_size: [singleVariantFieldSchema],
    resolution: [singleVariantFieldSchema],
    lens_kit: [singleVariantFieldSchema],
    material: [singleVariantFieldSchema],
    size: [singleVariantFieldSchema],
    fabric: [singleVariantFieldSchema],
    weight: [singleVariantFieldSchema],
    dimensions: [singleVariantFieldSchema],
    capacity: [singleVariantFieldSchema],
    options: [{ type: String }],
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
    },
  }
);

export const VariantField = model<IVariantField>('VariantField', variantFieldSchema);
