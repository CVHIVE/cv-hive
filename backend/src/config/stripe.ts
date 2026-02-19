import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
  apiVersion: '2023-10-16' as any,
});

export const STRIPE_PLANS = {
  DEMO: {
    name: 'Demo',
    priceId: null, // Free plan
    priceAED: 0,
    contactRevealsLimit: 0,
  },
  PROFESSIONAL: {
    name: 'Professional',
    priceId: process.env.STRIPE_PROFESSIONAL_PRICE_ID || null,
    priceAED: 499,
    contactRevealsLimit: 100,
  },
  ENTERPRISE: {
    name: 'Enterprise',
    priceId: process.env.STRIPE_ENTERPRISE_PRICE_ID || null,
    priceAED: 1499,
    contactRevealsLimit: -1, // unlimited
  },
} as const;

export default stripe;
