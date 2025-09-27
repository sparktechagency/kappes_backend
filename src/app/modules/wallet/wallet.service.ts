import QueryBuilder from '../../builder/QueryBuilder';
import { transferToVendorAtWithdraw } from '../order/order.utils';
import { User } from '../user/user.model';
import { IWallet, WalletType } from './wallet.interface';
import { Wallet } from './wallet.model';

const addToWallet = async (userId: string, payload: { amount: number; type: WalletType }): Promise<IWallet> => {
     let wallet = await Wallet.findOne({ user: userId });

     if (!wallet) {
          wallet = await Wallet.create({
               user: userId,
          });
     }

     if (payload.type === WalletType.CREDIT) {
          wallet.totalLifeTimeEarning += payload.amount;
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

const withDrawFromAvailableBalance = async (userId: string, amount: number) => {
     const wallet = await Wallet.findOne({ user: userId });
     if (!wallet) {
          throw new Error('Wallet not found');
     }
     const vendor = await User.findById(userId).populate({
          path: 'subscription',
          populate: {
               path: 'package',
          },
     });
     if (!vendor) {
          throw new Error('Vendor not found');
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
