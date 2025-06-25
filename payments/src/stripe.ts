import Stripe from 'stripe';

if (!process.env.STRIPE_KEY) {
    throw new Error('STRIPE_KEY must be defined');
}

// @ts-ignore
export const stripe = new Stripe(process.env.STRIPE_KEY, {
    typescript: true,
});

