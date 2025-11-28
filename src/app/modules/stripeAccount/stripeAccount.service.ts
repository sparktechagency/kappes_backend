import { StatusCodes } from 'http-status-codes';
import AppError from '../../../errors/AppError';
import stripe from '../../config/stripe.config';
import { IJwtPayload } from '../auth/auth.interface';
import { User } from '../user/user.model';
import { StripeAccount } from './stripeAccount.model';
import { successHTMLstripeConnection } from './stripeAccount.utils';
import config from '../../../config';

const createConnectedStripeAccount = async (user: IJwtPayload, host: string, protocol: string): Promise<any> => {
     const existingAccount = await StripeAccount.findOne({
          user: user?.id,
     }).select('user accountId isCompleted');
     console.log('existingAccount', existingAccount);

     if (existingAccount) {
          if (existingAccount.isCompleted) {
               return {
                    success: false,
                    message: 'Account already exists',
                    data: existingAccount,
               };
          }

          const onboardingLink = await stripe.accountLinks.create({
               account: existingAccount.accountId,
               refresh_url: `${protocol}://${host}/api/v1/stripe/refreshAccountConnect/${existingAccount.accountId}`,
               return_url: `${protocol}://${host}/api/v1/stripe/success-account/${existingAccount.accountId}`,
               type: 'account_onboarding',
          });
          // console.log('onboardingLink-1', onboardingLink);

          return {
               success: true,
               message: 'Please complete your account',
               url: onboardingLink.url,
          };
     }

     const account = await stripe.accounts.create({
          type: 'express',
          email: user.email,
          country: 'US',
          capabilities: {
               card_payments: { requested: true },
               transfers: { requested: true },
          },
     });
     console.log('stripe account', account);

     await StripeAccount.create({ accountId: account.id, userId: user?.id });

     const onboardingLink = await stripe.accountLinks.create({
          account: account.id,
          refresh_url: `${protocol}://${host}/api/v1/stripe/refreshAccountConnect/${account.id}`,
          return_url: `${protocol}://${host}/api/v1/stripe/success-account/${account.id}`,
          type: 'account_onboarding',
     });
     console.log('onboardingLink-2', onboardingLink);

     return {
          success: true,
          message: 'Please complete your account',
          url: onboardingLink.url,
     };
};

const refreshAccountConnect = async (id: string, host: string, protocol: string): Promise<string> => {
     const onboardingLink = await stripe.accountLinks.create({
          account: id,
          refresh_url: `${protocol}://${host}/api/v1/stripe/refreshAccountConnect/${id}`,
          return_url: `${protocol}://${host}/api/v1/stripe/success-account/${id}`,
          type: 'account_onboarding',
     });
     return onboardingLink.url;
};

const onConnectedStripeAccountSuccess = async (accountId: string) => {
     console.log({ accountId });
     if (!accountId) {
          throw new AppError(StatusCodes.NOT_FOUND, 'account Id not found');
     }

     type TPopulatedUser = {
          full_name: string;
          email: string;
          image: string;
     };

     const stripeAccounts = await StripeAccount.findOne({ accountId }).populate({
          path: 'userId',
          select: 'full_name email image',
     });

     if (!stripeAccounts) {
          throw new AppError(StatusCodes.NOT_FOUND, 'account not found');
     }

     await StripeAccount.updateOne({ accountId }, { isCompleted: true });

     const userUpdate = await User.findByIdAndUpdate(stripeAccounts.userId._id, { $set: { stripeConnectedAccount: accountId } }, { new: true });

     if (!userUpdate) {
          throw new AppError(StatusCodes.NOT_FOUND, 'User not found');
     }

     // const user = stripeAccounts.userId as unknown as TPopulatedUser;

     const html = successHTMLstripeConnection({
          name: userUpdate.full_name,
          email: userUpdate.email,
          image: `${config.backend_url}${userUpdate.image}`,
          dashboardLink: `${config.frontend_url_dashboard}/seller/overview`,
     });

     // const data = { user: { name: user.full_name } };
     // io.emit('join stripe account', data);

     return html;
};

const stripeLoginLink = async (user: IJwtPayload) => {
     console.log('🚀 ~ stripeLoginLink ~ user:', user);
     // Get the logged-in user's data (ensure the user is authenticated)
     const userId = user.id;

     // // Retrieve the user's Stripe account information from the database
     // const isExistUser = await User.findById(userId).select("stripeConnectedAccount");
     // if (!isExistUser || !isExistUser.stripeConnectedAccount) {
     //   throw new AppError(StatusCodes.NOT_FOUND, "Stripe account not connected");
     // }

     // const stripeAccountId = isExistUser.stripeConnectedAccount;

     // check if shop owner has stripe connected account
     const hasStripeAccount = await StripeAccount.findOne({ userId, isCompleted: true });
     if (!hasStripeAccount) {
          throw new AppError(StatusCodes.NOT_FOUND, 'Stripe account not found');
     }

     const stripeAccountId = hasStripeAccount.accountId;
     const loginLink = await stripe.accounts.createLoginLink(stripeAccountId);
     return loginLink.url;
};

export const stripeAccountService = {
     createConnectedStripeAccount,
     refreshAccountConnect,
     onConnectedStripeAccountSuccess,
     stripeLoginLink,
};
