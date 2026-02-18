import { Router } from 'express';
import express from 'express';
import { handleStripeWebhook } from './stripe.controller';

const router = Router();

// Stripe webhooks need raw body, not JSON parsed
router.post('/stripe', express.raw({ type: 'application/json' }), handleStripeWebhook);

export default router;
