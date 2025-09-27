import { Schema, model } from 'mongoose';
import { IWallet } from './wallet.interface';

const walletSchema = new Schema<IWallet>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    totalLifeTimeEarning: {
      type: Number,
      default: 0,
    },
    totalLifeTimeWithdrawal: {
      type: Number,
      default: 0,
    },
    totalAvailableBalanceToWithdraw: {
      type: Number,
      default: 0,
    },
    totalLifeTimeSpentAsCustomer: {
      type: Number,
      default: 0,
    },
    adminDueAmount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
    },
  }
);


export const Wallet = model<IWallet>('Wallet', walletSchema);