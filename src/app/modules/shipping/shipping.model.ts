import { model, Schema } from 'mongoose';

const shippingSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User' },
     type: {
          type: String,
          enum: ['ship-station', 'chit-chat'],
     },
     shipstation_api_key: {
          type: String,
     },
     shipstation_api_secret: {
          type: String,
     },
     chitchats_client_id: {
          type: String,
     },
     chitchats_api_token: {
          type: String,
     },
});

export const ShippingKeys = model('ShippingKeys', shippingSchema);
