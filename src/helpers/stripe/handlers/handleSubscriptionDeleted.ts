import Stripe from 'stripe';
import stripe from '../../../config/stripe';
// const User:any = "";
// const Subscription:any = "";

export const handleSubscriptionDeleted = async (data: Stripe.Subscription) => {
     // Retrieve the subscription from Stripe
     const subscription = await stripe.subscriptions.retrieve(data.id);
};
