import QueryBuilder from '../../builder/QueryBuilder';
import { transferToVendorAtWithdraw } from '../order/order.utils';
import { User } from '../user/user.model';
import { Wallet } from './wallet.model';
import { PAYMENT_METHOD } from '../order/order.enums';
import { WalletType } from './wallet.interface';

const addToWallet = async (userId: string, payload: { amount: number; type: WalletType; paymentMethod: PAYMENT_METHOD }) => {
     let wallet = await Wallet.findOne({ user: userId });

     if (!wallet) {
          wallet = await Wallet.create({
               user: userId,
          });
     }

     if (payload.type === WalletType.CREDIT) {
          wallet.totalLifeTimeEarning += payload.amount;
          if (payload.paymentMethod === PAYMENT_METHOD.COD) {
               wallet.totalLifeTimeWithdrawal += payload.amount;
          } else {
               wallet.totalAvailableBalanceToWithdraw += payload.amount;
          }
     } else {
          wallet.totalLifeTimeSpentAsCustomer += payload.amount;
     }

     await wallet.save();

     return wallet;
};

const getWallet = async (userId: string, query: any) => {
     const querBuilder = new QueryBuilder(Wallet.find({ user: userId }), query);
     const result = await querBuilder.fields().sort().paginate().filter().modelQuery;
     const meta = await querBuilder.countTotal();
     return { result, meta };
};

const withDrawFromAvailableBalance = async (vendorId: string, amount: number) => {
     const wallet = await Wallet.findOne({ user: vendorId });
     if (!wallet) {
          throw new Error('Wallet not found');
     }
     const vendor = await User.findById(vendorId).select('stripeConnectedAccount').lean();
     if (!vendor) {
          throw new Error('Vendor not found');
     }
     if (!vendor.stripeConnectedAccount) {
          throw new Error('Vendor stripe connected account not found');
     }
     if (wallet.totalAvailableBalanceToWithdraw < amount) {
          throw new Error('Insufficient balance');
     }

     const transfer = await transferToVendorAtWithdraw({
          stripeConnectedAccount: vendor.stripeConnectedAccount!,
          amount,
          walletId: wallet._id.toString(),
     });
     if (!transfer) {
          throw new Error('Transfer not created');
     }
     return transfer;
};

export const WalletService = {
     addToWallet,
     getWallet,
     withDrawFromAvailableBalance,
};
