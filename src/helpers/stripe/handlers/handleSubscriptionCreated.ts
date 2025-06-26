import { StatusCodes } from 'http-status-codes';
import Stripe from 'stripe';
import stripe from '../../../config/stripe';
import AppError from '../../../errors/AppError'; 
import { User } from '../../../app/modules/user/user.model';
import { sendNotifications } from '../../notificationsHelper';
import { USER_ROLES } from '../../../app/modules/user/user.enums';

const formatUnixToIsoUtc = (timestamp: number): string => {
     const date = new Date(timestamp * 1000);
     return date.toISOString().replace('Z', '+00:00');
};

export const handleSubscriptionCreated = async (data: Stripe.Subscription) => {
     try {
          const getAdmin = await User.findOne({ role: USER_ROLES.SUPER_ADMIN });
          if (!getAdmin) {
               throw new AppError(StatusCodes.NOT_FOUND, 'Admin not found!');
          }
          const subscription = await stripe.subscriptions.retrieve(data.id);
          const customer = (await stripe.customers.retrieve(subscription.customer as string)) as Stripe.Customer;
          const priceId = subscription.items.data[0]?.price?.id;
          const invoice = await stripe.invoices.retrieve(subscription.latest_invoice as string);
          const amountPaid = invoice?.total / 100;

          // Extract other needed fields from the subscription object
          const remaining = subscription.items.data[0]?.quantity || 0;
          // Convert Unix timestamp to Date
          const subscriptionId = subscription.id;
          // Check if customer email is available
          if (!customer?.email) {
               throw new AppError(StatusCodes.BAD_REQUEST, 'No email found for the customer!');
          }

          if (customer?.email) {
               const existingUser = await User.findOne({ email: customer?.email });
               if (!existingUser) {
                    throw new AppError(StatusCodes.NOT_FOUND, `User not found for email: ${customer.email}`);
               }
               if (existingUser) { 
               } else {
                    throw new AppError(StatusCodes.NOT_FOUND, `User not found for email: ${customer?.email}`);
               }
          } else {
               throw new AppError(StatusCodes.BAD_REQUEST, 'No email found for the customer!');
          }
     } catch (error) {
          console.error('Error in handleSubscriptionCreated:', error);
          throw new AppError(StatusCodes.INTERNAL_SERVER_ERROR, `Error in handleSubscriptionCreated: ${error instanceof Error ? error.message : error}`);
     }
};
