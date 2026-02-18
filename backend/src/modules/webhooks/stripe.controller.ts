import { Request, Response } from 'express';
import stripe from '../../config/stripe';
import * as subService from '../subscriptions/subscriptions.service';

export const handleStripeWebhook = async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;
  try {
    if (webhookSecret && sig) {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } else {
      // Dev mode: trust the event payload
      event = req.body;
    }
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).json({ error: 'Invalid signature' });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await subService.handleCheckoutComplete(event.data.object);
        break;
      case 'customer.subscription.updated':
        await subService.handleSubscriptionUpdated(event.data.object);
        break;
      case 'customer.subscription.deleted':
        await subService.handleSubscriptionDeleted(event.data.object);
        break;
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
  } catch (error: any) {
    console.error(`Error handling ${event.type}:`, error.message);
  }

  res.json({ received: true });
};
