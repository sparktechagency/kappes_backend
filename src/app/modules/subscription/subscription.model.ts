import { Schema, model } from 'mongoose';
import { ISubscription, SubscriptionModel } from './subscription.interface';
import { SubscriptionStatus } from './subscription.enum';

const subscriptionSchema = new Schema<ISubscription, SubscriptionModel>(
  {
    email: { type: String, required: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: false },
    package: { type: Schema.Types.ObjectId, ref: 'Package', required: true },
    subscriptionId: { type: String, required: true },
    status: { type: String, enum: SubscriptionStatus, required: true, default: SubscriptionStatus.ACTIVE },
    trxId: { type: String, required: false },
  },
  { timestamps: true }
);

export const Subscription = model<ISubscription, SubscriptionModel>(
  'Subscription',
  subscriptionSchema
);
