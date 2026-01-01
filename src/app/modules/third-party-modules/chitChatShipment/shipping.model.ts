import { model, Schema } from 'mongoose';

const shippingSchema = new Schema({
     shopId: { type: Schema.Types.ObjectId, ref: 'Shop' },
     chitchats_client_id: {
          type: String,
     },
     chitchats_access_token: {
          type: String,
     },
});

export const ShippingKeys = model('ShippingKeys', shippingSchema);
