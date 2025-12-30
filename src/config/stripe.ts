import Stripe from 'stripe';
import config from '.';

// const stripe = new Stripe(config.stripe.stripe_secret_key as string);

// Initialize Stripe with your secret key and specify the API version
const stripe = new Stripe(config.stripe.stripe_secret_key as string, {
     apiVersion: '2025-05-28.basil', // Use the latest version (or your required version)
});

export default stripe;
