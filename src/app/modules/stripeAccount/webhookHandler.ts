import { Request, Response } from 'express';
import Stripe from 'stripe';
import stripe from '../../config/stripe.config';
import config from '../../../config';
import { StatusCodes } from 'http-status-codes';
import AppError from '../../../errors/AppError';
import { paymentService } from '../payment/payment.service';
import { ShopService } from '../shop/shop.service';
import { Order } from '../order/order.model';
import { Payment } from '../payment/payment.model';
import { PAYMENT_STATUS } from '../order/order.enums';
import { createPayout } from '../order/order.utils';
import { Shop } from '../shop/shop.model';
import { IOrder } from '../order/order.interface';

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
          console.log(`Transfer for user ${transfer.destination} created`);

          // Get order and shop details from transfer metadata
          const order = await Order.findById(transfer.metadata?.orderId);
          if (!order) {
               throw new AppError(StatusCodes.BAD_REQUEST, 'Order not found');
          }
          // update isTransferd true
          order.isPaymentTransferdToVendor = true;
          await order.save();
          //   const shop = await Shop.findById(order.shop).populate('owner');
          //   // Create payout to vendor's connected account
          //   await createPayout({
          //        stripeConnectedAccount: (shop!.owner as any).stripeConnectedAccount,
          //        amount: transfer.amount,
          //        orderId: transfer.metadata?.orderId,
          //   });
     } catch (error) {
          console.error('Error in handleTransferCreated:', error);
     }
};
