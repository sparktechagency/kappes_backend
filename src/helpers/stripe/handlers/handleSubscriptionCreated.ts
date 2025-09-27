import Stripe from 'stripe';
import stripe from '../../../app/config/stripe.config';
import { User } from '../../../app/modules/user/user.model';
import { Package } from '../../../app/modules/package/package.model';
import { Subscription } from '../../../app/modules/subscription/subscription.model';
import { SubscriptionService } from '../../../app/modules/subscription/subscription.service';
import AppError from '../../../errors/AppError';
import { StatusCodes } from 'http-status-codes';

export const handleSubscriptionCreated = async (data: Stripe.Subscription) => {
     console.log('🚀 ~ handleSubscriptionCreated ~ handleSubscriptionCreated:*******************************************', handleSubscriptionCreated);
     console.log('🔔 Processing subscription created event with data:', JSON.stringify(data, null, 2));

     // Validate that we have the required data
     if (!data.id) {
          console.log('❌ Invalid subscription data - missing subscription ID');
          throw new Error('Invalid subscription data - missing subscription ID');
     }

     if (!data.customer) {
          console.log('❌ Invalid subscription data - missing customer ID');
          throw new Error('Invalid subscription data - missing customer ID');
     }

     if (!data.items || !data.items.data || data.items.data.length === 0) {
          console.log('❌ Invalid subscription data - missing subscription items');
          throw new Error('Invalid subscription data - missing subscription items');
     }

     if (!data.items.data[0].plan || !data.items.data[0].plan.product) {
          console.log('❌ Invalid subscription data - missing product ID in plan');
          throw new Error('Invalid subscription data - missing product ID in plan');
     }
     try {
          // Retrieve the subscription from Stripe
          const subscription = await stripe.subscriptions.retrieve(data.id);
          console.log('✅ Retrieved subscription from Stripe:', subscription.id);

          // Retrieve the customer associated with the subscription
          const customer = (await stripe.customers.retrieve(subscription.customer as string)) as Stripe.Customer;
          console.log('✅ Retrieved customer from Stripe:', customer.id, customer.email);

          // Extract the price ID from the subscription items
          const productId = subscription.items.data[0].plan.product as string;
          console.log('✅ Extracted product ID from subscription:', productId);

          // Retrieve the invoice to get the transaction ID and amount paid
          const invoice: any = await stripe.invoices.retrieve(subscription.latest_invoice as string);
          console.log('✅ Retrieved invoice from Stripe:', invoice.id);

          const trxId = invoice?.payment_intent;
          const amountPaid = invoice?.total / 100;
          console.log('💰 Transaction ID:', trxId, 'Amount paid:', amountPaid);

          if (customer?.email) {
               console.log('📧 Customer email found:', customer.email);
               // Find the user by email
               const existingUser = await User.findOne({ email: customer?.email });
               console.log('👤 Existing user lookup result:', existingUser ? existingUser._id : 'Not found');

               if (existingUser) {
                    // Find the pricing plan by priceId
                    const pricingPlan = await Package.findOne({
                         stripeProductId: productId,
                    });
                    console.log('📦 Pricing plan lookup result:', pricingPlan ? pricingPlan._id : 'Not found');

                    if (pricingPlan) {
                         // Find the current active subscription
                         const currentActiveSubscription = await Subscription.findOne({
                              user: existingUser._id,
                              status: 'active',
                         });
                         console.log('🔁 Current active subscription:', currentActiveSubscription ? currentActiveSubscription._id : 'None found');

                         if (currentActiveSubscription) {
                              console.log('🗑️ Cancelling current active subscription...');
                              await SubscriptionService.cancelSubscription(existingUser._id.toString());
                              await Subscription.findOneAndDelete(currentActiveSubscription._id);
                              console.log('✅ Cancelled and deleted previous subscription');
                         }

                         // Create a new subscription record
                         console.log('📝 Creating new subscription record...');
                         const newSubscription = new Subscription({
                              package: pricingPlan._id,
                              status: subscription.status,
                              user: existingUser._id,
                              email: existingUser.email,
                              subscriptionId: subscription.id,
                              trxId,
                         });
                         await newSubscription.save();
                         console.log('✅ New subscription saved:', newSubscription._id);

                         const purchasedPlan = await User.findByIdAndUpdate(
                              existingUser._id,
                              {
                                   subscription: newSubscription._id,
                                   isSubscribed: subscription.status === 'active',
                                   stripeCustomerId: customer.id,
                                   allowedProducts: pricingPlan.features.allowedProducts,
                                   isAllowedUnlimitedProducts: pricingPlan.features.isAllowedUnlimitedProducts,
                                   isIncludedBlackFriday: pricingPlan.features.isIncludedBlackFriday,
                                   isIncludedPromos: pricingPlan.features.isIncludedPromos,
                                   isIncludedRoadshow: pricingPlan.features.isIncludedRoadshow,
                                   commisionPercentage: pricingPlan.features.commisionPercentage,
                              },
                              { new: true },
                         );
                         console.log('✅ Updated user with subscription info:', purchasedPlan ? purchasedPlan._id : 'Update failed');

                         if (!purchasedPlan) {
                              throw new AppError(StatusCodes.INTERNAL_SERVER_ERROR, 'Failed to update user subscription');
                         }
                    } else {
                         // Pricing plan not found
                         console.log('❌ Pricing plan not found for Product ID:', productId);
                         throw new AppError(StatusCodes.NOT_FOUND, `Pricing plan with Product ID: ${productId} not found!`);
                    }
               } else {
                    // User not found
                    console.log('❌ User not found for email:', customer.email);
                    throw new AppError(StatusCodes.NOT_FOUND, `User with Email: ${customer.email} not found!`);
               }
          } else {
               // No email found for the customer
               console.log('❌ No email found for customer:', customer.id);
               throw new AppError(StatusCodes.BAD_REQUEST, 'No email found for the customer!');
          }
     } catch (error: any) {
          console.error('❌ Error handling subscription created:', error);
          console.error('❌ Error stack:', error.stack);
          throw new AppError(StatusCodes.INTERNAL_SERVER_ERROR, `An error occurred while processing the subscription: ${error.message || error}`);
     }
};
