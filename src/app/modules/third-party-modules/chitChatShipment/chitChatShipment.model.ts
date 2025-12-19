import { Schema, model } from 'mongoose';
import {
     chitChatShipment_order_store,
     chitChatShipment_package_contents,
     chitChatShipment_package_type,
     chitChatShipment_postage_type,
     chitChatShipment_size_unit,
     chitChatShipment_value_currency,
     chitChatShipment_weight_unit,
} from './chitChatShipment.enum';
import { IChitChatShipment } from './chitChatShipment.interface';

const ChitChatShipmentSchema = new Schema<IChitChatShipment>(
     {
          name: {
               type: String,
               required: true,
          },
          address_1: {
               type: String,
               required: true,
          },
          address_2: String,
          city: {
               type: String,
               required: true,
          },
          province_code: String,
          postal_code: String,
          country_code: {
               type: String,
               required: true,
          },
          phone: String,
          email: String,
          return_name: String,
          return_address_1: String,
          return_address_2: String,
          return_city: String,
          return_province_code: String,
          return_phone: String,
          package_contents: {
               type: String,
               enum: chitChatShipment_package_contents,
          },
          description: String,
          value: {
               type: String,
               required: true,
          },
          value_currency: {
               type: String,
               enum: chitChatShipment_value_currency,
          },
          order_id: String,
          order_store: {
               type: String,
               enum: chitChatShipment_order_store,
          },
          package_type: {
               type: String,
               enum: chitChatShipment_package_type,
               required: true,
          },
          weight_unit: {
               type: String,
               enum: chitChatShipment_weight_unit,
               required: true,
          },
          weight: {
               type: Number,
               required: true,
          },
          size_unit: {
               type: String,
               enum: chitChatShipment_size_unit,
               required: true,
          },
          size_x: {
               type: Number,
               required: true,
          },
          size_y: {
               type: Number,
               required: true,
          },
          size_z: {
               type: Number,
               required: true,
          },
          insurance_requested: Boolean,
          signature_requested: Boolean,
          vat_reference: String,
          duties_paid_requested: Boolean,
          postage_type: {
               type: String,
               enum: chitChatShipment_postage_type,
          },
          cheapest_postage_type_requested: String,
          tracking_number: String,
          ship_date: String,
          line_items: [
               {
                    quantity: {
                         type: Number,
                         required: true,
                    },
                    description: {
                         type: String,
                         required: true,
                    },
                    value_amount: {
                         type: String,
                         required: true,
                    },
                    currency_code: {
                         type: String,
                         required: true,
                    },
                    hs_tariff_code: {
                         type: String,
                         required: true,
                    },
                    sku_code: {
                         type: String,
                         required: true,
                    },
                    origin_country: {
                         type: String,
                         required: true,
                    },
                    weight: {
                         type: Number,
                         required: true,
                    },
                    weight_unit: {
                         type: String,
                         required: true,
                    },
               },
          ],
          isDeleted: { type: Boolean, default: false },
          deletedAt: { type: Date },
     },

     {
          timestamps: true,
          toJSON: {
               virtuals: true,
          },
     },
);

ChitChatShipmentSchema.pre('find', function (next) {
     this.find({ isDeleted: false });
     next();
});

ChitChatShipmentSchema.pre('findOne', function (next) {
     this.findOne({ isDeleted: false });
     next();
});

ChitChatShipmentSchema.pre('aggregate', function (next) {
     this.pipeline().unshift({ $match: { isDeleted: { $ne: true } } });
     next();
});

export const ChitChatShipment = model<IChitChatShipment>('ChitChatShipment', ChitChatShipmentSchema);
