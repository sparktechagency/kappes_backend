import { Model, Types } from 'mongoose';
import { SubscriptionStatus } from './subscription.enum';

export type ISubscription = {
  email: string;
  user: Types.ObjectId;
  package: Types.ObjectId;
  subscriptionId: string;
  trxId: string;
  status: SubscriptionStatus;
  createdAt: Date;
  updatedAt: Date;
};

export type SubscriptionModel = Model<ISubscription>;
