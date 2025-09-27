// use zod to create and update balance
import { z } from 'zod';
import { WalletType } from './wallet.interface';

export const addBalanceValidation = z.object({
    amount: z.number(),
    type: z.enum([WalletType.CREDIT]),
});

export const withDrawFromAvailableBalance = z.object({
    amount: z.number(),
    type: z.enum([WalletType.DEBIT]),
});


export const WalletValidation = {
    addBalanceValidation,
    withDrawFromAvailableBalance,
};