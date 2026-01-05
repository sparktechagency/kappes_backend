import { model, Schema } from 'mongoose';

const shippingSchema = new Schema({
     shopId: { type: Schema.Types.ObjectId, ref: 'Shop', unique: true },
     chitchats_client_id: {
          type: String,
          required: true,
          select: false,
     },
     chitchats_access_token: {
          type: String,
          required: true,
          select: false,
     },
});

export const ShippingKeys = model('ShippingKeys', shippingSchema);
