import {  Types } from 'mongoose';

export interface IWallet {
  user: Types.ObjectId;
  totalLifeTimeEarning: number;
  totalLifeTimeWithdrawal: number;
  totalAvailableBalanceToWithdraw: number;
  totalLifeTimeSpentAsCustomer: number;
}

export enum WalletType {
     CREDIT = 'credit',
     DEBIT = 'debit',
}

