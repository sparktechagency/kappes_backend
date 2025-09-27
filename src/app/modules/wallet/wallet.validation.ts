// use zod to create and update balance
import { z } from 'zod';
import { WalletType } from './wallet.interface';
import { PAYMENT_METHOD } from '../order/order.enums';

export const addBalanceValidation = z.object({
    amount: z.number(),
    type: z.enum([WalletType.CREDIT]),
    paymentMethod: z.nativeEnum(PAYMENT_METHOD),
});

export const withDrawFromAvailableBalance = z.object({
    amount: z.number(),
    type: z.enum([WalletType.DEBIT]),
});


export const WalletValidation = {
    addBalanceValidation,
    withDrawFromAvailableBalance,
};