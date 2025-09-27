import { Request, Response } from 'express';
import Stripe from 'stripe';
import stripe from '../../config/stripe.config';
import config from '../../../config';
import { User } from '../../../app/modules/user/user.model';
import { Package } from '../../../app/modules/package/package.model';
import { Subscription } from '../../../app/modules/subscription/subscription.model';
import { SubscriptionService } from '../../../app/modules/subscription/subscription.service';
import AppError from '../../../errors/AppError';
import { StatusCodes } from 'http-status-codes';
import { Order } from '../order/order.model';
import { PAYMENT_STATUS } from '../order/order.enums';
import { Payment } from '../payment/payment.model';
import { paymentService } from '../payment/payment.service';
import { Wallet } from '../wallet/wallet.model';
import { TransferType } from './stripeAccount.interface';

const webhookHandler = async (req: Request, res: Response): Promise<void> => {
     console.log('Webhook received');
     const sig = req.headers['stripe-signature'];
     const webhookSecret = config.stripe.stripe_webhook_secret;

     if (!webhookSecret) {
          console.error('Stripe webhook secret not set');
          res.status(500).send('Webhook secret not configured');
          return;
     }

     let event: Stripe.Event;

     try {
          event = stripe.webhooks.constructEvent(req.body, sig as string, webhookSecret);
     } catch (err: any) {
          console.error('Webhook signature verification failed:', err.message);
          res.status(400).send(`Webhook Error: ${err.message}`);
          return;
     }

     console.log('event.type', event.type);
     try {
          switch (event.type) {
               case 'checkout.session.completed':
                    await handlePaymentSucceeded(event.data.object);
                    break;
               case 'customer.subscription.created':
                    console.log('🔄 Processing customer.subscription.created event');
                    await handleSubscriptionCreated(event.data.object as Stripe.Subscription);
                    console.log('✅ Successfully processed customer.subscription.created event');
                    break;
               case 'checkout.session.async_payment_failed':
                    await handleSubscriptionUpdated(event.data.object);
                    break;
               case 'transfer.created':
                    await handleTransferCreated(event.data.object);
                    break;
               default:
                    console.log(`Unhandled event type: ${event.type}`);
                    break;
          }

          // Responding after handling the event
          res.status(200).json({ received: true });
     } catch (err: any) {
          console.error('Error handling the event:', err);
          res.status(500).send(`Internal Server Error: ${err.message}`);
     }
};

export default webhookHandler;

// Function for handling a successful payment
const handlePaymentSucceeded = async (session: Stripe.Checkout.Session) => {
     try {
          const {
               products,
               coupon,
               shippingAddress,
               paymentMethod,
               user,
               shop,
               amount,
               // extra field for payments gatewayResponse,transactionId,status,order
          }: any = session.metadata;

          // Parsing the 'products' metadata, as it was previously stringified before sending to Stripe
          const productsParsed = JSON.parse(products);

          console.log('1', 'productsParsed:', productsParsed);

          const paymentIntent = session.payment_intent as string;

          console.log('paymentIntent : 2', paymentIntent);

          const isPaymentExist = await paymentService.isPaymentExist(paymentIntent);

          if (isPaymentExist) {
               throw new AppError(StatusCodes.BAD_REQUEST, 'Payment Already exist');
          }

          console.log('isPaymentExist : 3');

          // const { owner, revenue } = await ShopService.isShopExist(shop);
          // console.log('owner : ', owner);

          // const stripeAccountId = owner?.stripeConnectedAccount;

          // if (!stripeAccountId) {
          //     throw new AppError(StatusCodes.NOT_FOUND, 'Stripe account not found');
          // }

          // console.log('stripeAccountId : 4');

          // const adminParcentage = revenue;

          // if (!adminParcentage) {
          //     throw new AppError(
          //         StatusCodes.INTERNAL_SERVER_ERROR,
          //         'Admin fee percentage not found',
          //     );
          // }

          // const adminRevenue = Math.ceil((amount * adminParcentage) / 100);

          // const shopOwnerRevenue = amount - adminRevenue;

          // console.log({ adminParcentage });
          // console.log({ adminRevenue });
          // console.log({ shopOwnerRevenue });
          // console.log({ amount });
          // console.log('shopOwnerRevenue : 5');

          // const balance = await stripe.balance.retrieve();

          // console.log('balance');
          // console.log(balance);

          // if (balance?.available?.[0].amount < shopOwnerRevenue * 100) {
          //     throw new AppError(
          //         StatusCodes.BAD_REQUEST,
          //         'Insufficient funds in admin account for transfer',
          //     );
          // }

          // console.log('balance : 6');

          // const shopAccountFromStripe = await stripe.accounts.retrieve(stripeAccountId);

          // if (shopAccountFromStripe?.requirements?.disabled_reason) {
          //     throw new AppError(
          //         StatusCodes.BAD_REQUEST,
          //         `Business's stripe account is not enabled: ${shopAccountFromStripe.requirements.disabled_reason}`,
          //     );
          // }

          // console.log('businessAccount : 7');

          // const transfer = await stripe.transfers.create({
          //     amount: Math.floor(shopOwnerRevenue * 100),
          //     currency: 'usd',
          //     destination: stripeAccountId,
          // });

          // console.log('transfer : 7');

          // // Payout to vendor's external bank account or card
          // const externalAccount = await stripe.accounts.listExternalAccounts(
          //     stripeAccountId,
          //     { object: 'bank_account' },
          // );

          // if (!externalAccount.data.length) {
          //     throw new AppError(
          //         StatusCodes.BAD_REQUEST,
          //         'No external bank accounts found for the vendor',
          //     );
          // }

          // console.log('externalAccount : 8');

          // //   Payment receive business account instant or standard
          // await stripe.payouts.create(
          //     {
          //         amount: Math.floor(shopOwnerRevenue * 100), // Convert to cents
          //         currency: 'usd',
          //         destination: externalAccount.data[0].id,
          //         method: 'instant', // Can change to 'instant' for instant payouts
          //     },
          //     { stripeAccount: stripeAccountId },
          // );

          // console.log('payouts : 9');
          const newOrder = await Order.create({
               products: productsParsed,
               coupon,
               shippingAddress,
               paymentMethod,
               paymentStatus: PAYMENT_STATUS.PAID,
               shop,
               user,
          });

          console.log('newBooking : 10');

          const newPayment = await Payment.create({
               user,
               order: newOrder._id,
               shop,
               method: paymentMethod,
               status: PAYMENT_STATUS.PAID,
               transactionId: session.id,
               paymentIntent,
               amount,
               gatewayResponse: session,
               // extra field for payments gatewayResponse,transactionId,status,order
          });

          newOrder.payment = newPayment._id;
          await newOrder.save();

          console.log('newPayment : 11');
          // send email to user, notification to shop woner or admins socket
          /** rabby
           * find shop
           * make array for specific this shop's owner and admins
           * send notification to them using socket
           *
           * send email to user if poosible send order invoice pdf
           */
          return newPayment;
     } catch (error) {
          console.error('Error in handlePaymentSucceeded:', error);
     }
};

export const handleSubscriptionCreated = async (data: Stripe.Subscription) => {
     console.log('🚀 ~ handleSubscriptionCreated ~ handleSubscriptionCreated:*******************************************');
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

// Function for handling subscription update or payment failure
const handleSubscriptionUpdated = async (session: Stripe.Checkout.Session) => {
     try {
          console.log(`Subscription for user ${session.client_reference_id} updated or payment failed`);
          // Update subscription status in your DB
     } catch (error) {
          console.error('Error in handleSubscriptionUpdated:', error);
     }
};

// handleTransferCreated
const handleTransferCreated = async (transfer: Stripe.Transfer) => {
     try {
          const { orderId, type, amount, walletId } = transfer.metadata;
          console.log(`Transfer for user ${transfer.destination} created | ${type}`);

          if (type === TransferType.TRANSFER) {
               // Get order and shop details from transfer metadata
               const order = await Order.findById(orderId);
               if (!order) {
                    throw new AppError(StatusCodes.BAD_REQUEST, 'Order not found');
               }
               // update isTransferd true
               order.isPaymentTransferdToVendor = true;
               await order.save();
          } else if (type === TransferType.WITHDRAW) {
               // Get order and shop details from transfer metadata
               const wallet = await Wallet.findById(walletId);
               if (!wallet) {
                    throw new AppError(StatusCodes.BAD_REQUEST, 'Wallet not found');
               }
               // update isTransferd true
               wallet.totalAvailableBalanceToWithdraw -= Number(amount);
               wallet.totalLifeTimeWithdrawal += Number(amount);
               await wallet.save();
          }
     } catch (error) {
          console.error('Error in handleTransferCreated:', error);
     }
};
