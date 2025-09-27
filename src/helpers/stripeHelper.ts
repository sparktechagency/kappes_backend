import { StatusCodes } from "http-status-codes";
import stripe from "../app/config/stripe.config";
import AppError from "../errors/AppError";


export const createSubscriptionPackage = async (payload: any) => {
    // Create Product in Stripe
    const subscription = await stripe.products.create({
         name: payload.name as string,
         description: `${payload.name} Package, ${payload.price} BDT; ${payload.features.allowedProducts} Products; ${payload.features.isAllowedUnlimitedProducts ? 'Unlimited Products' : 'Limited Products'}; ${payload.features.commissionPercentage} Commission; ${payload.features.isIncludedBlackFriday ? 'Black Friday' : 'Not Black Friday'}; ${payload.features.isIncludedPromos ? 'Promos' : 'Not Promos'}; ${payload.features.isIncludedRoadshow ? 'Roadshow' : 'Not Roadshow'}`, 
    });
  
    let interval: 'month' | 'year' = 'month'; // Default to 'month'
    let intervalCount = 1; // Default to every 1 month
  
    // Map duration to interval_count
    switch (payload.duration) {
         case '1 month':
              interval = 'month';
              intervalCount = 1;
              break;
         case '3 months':
              interval = 'month';
              intervalCount = 3;
              break;
         case '6 months':
              interval = 'month';
              intervalCount = 6;
              break;
         case '1 year':
              interval = 'year';
              intervalCount = 1;
              break;
         default:
              interval = 'month';
              intervalCount = 1;
    }
  
    // Create Price for the Product
    const price = await stripe.prices.create({
         product: subscription.id,
         unit_amount: Number(payload.price) * 100, // in cents
         currency: 'usd', // or your chosen currency
         recurring: { interval, interval_count: intervalCount },
    });
  
    if (!price) {
         throw new AppError(StatusCodes.BAD_REQUEST, 'Failed to create price in Stripe');
    }
  
    return { subscription: subscription.id, priceId: price.id, paymentLink: '' };
  };
  
  export const createPaymentIntent = async (payload: any) => {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: payload.amount * 100,
      currency: 'usd',
      automatic_payment_methods: {
        enabled: true,
      },
    });
    if (!paymentIntent)
      throw new AppError(
        StatusCodes.BAD_REQUEST,
        'Failed to create payment intent!'
      );
    return {
      paymentIntent: paymentIntent.id,
      client_secret: paymentIntent.client_secret,
    };
  };
  