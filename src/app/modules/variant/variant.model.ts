import { Schema, model, Document } from "mongoose";
import { IVariant } from "./variant.interfaces"; // Import IVariant interface
import { VARIANT_OPTIONS } from "./variant.enums";

// Define Mongoose Schema based on IVariant interface
const variantSchema = new Schema<IVariant & Document>({
    categoryId: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    subCategoryId: { type: Schema.Types.ObjectId, ref: 'SubCategory', required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    slug: { type: String, required: true, unique: true },
    color: {
        name: { type: String, required: false },
        code: { type: String, required: false },
    },
    storage: { type: String, required: false },
    ram: { type: String, required: false },
    network_type: { type: [String], required: false },
    operating_system: { type: String, required: false },
    storage_type: { type: String, required: false },
    processor_type: { type: String, required: false },
    processor: { type: String, required: false },
    graphics_card_type: { type: String, required: false },
    graphics_card_size: { type: String, required: false },
    screen_size: { type: Number, required: false },
    resolution: { type: String, required: false },
    lens_kit: { type: String, required: false },
    material: { type: String, required: false },
    size: { type: String, required: false },
    fabric: { type: String, required: false },
    weight: { type: Number, required: false },
    dimensions: { type: String, required: false },
    capacity: { type: String, required: false },
    options: { type: String, enum: Object.values(VARIANT_OPTIONS) },
    isDeleted: { type: Boolean, default: false }
}, {
    timestamps: true,
});

// Query Middleware to exclude deleted users
variantSchema.pre('find', function (next) {
    this.find({ isDeleted: { $ne: true } });
    next();
});

variantSchema.pre('findOne', function (next) {
    this.find({ isDeleted: { $ne: true } });
    next();
});

variantSchema.pre('aggregate', function (next) {
    this.pipeline().unshift({ $match: { isDeleted: { $ne: true } } });
    next();
});
// Define the model with the interface and document type
const Variant = model<IVariant & Document>("Variant", variantSchema);

export default Variant;
