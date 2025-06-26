import { StatusCodes } from 'http-status-codes';
import Stripe from 'stripe';
import stripe from '../../../config/stripe';
import AppError from '../../../errors/AppError';
import { User } from '../../../app/modules/user/user.model';
// const User:any = "";
// const Subscription:any = "";

export const handleSubscriptionDeleted = async (data: Stripe.Subscription) => {
     // Retrieve the subscription from Stripe
     const subscription = await stripe.subscriptions.retrieve(data.id);
 
 
};
