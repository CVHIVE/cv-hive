import { Request, Response } from 'express';
import stripe from '../../config/stripe';
import * as subService from '../subscriptions/subscriptions.service';
import { activateJobAfterPayment } from '../jobs/jobs.service';

export const handleStripeWebhook = async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;
  try {
    if (webhookSecret && webhookSecret !== 'whsec_xxxxxxxxxxxxx' && sig) {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } else {
      // Dev mode: trust the event payload
      event = JSON.parse(req.body.toString());
    }
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).json({ error: 'Invalid signature' });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        if (session.metadata?.type === 'job_posting') {
          // Job posting payment
          console.log('\u2705 Job payment received for job:', session.metadata.job_id);
          await activateJobAfterPayment(session.metadata.job_id);
        } else {
          // Subscription payment
          await subService.handleCheckoutComplete(session);
        }
        break;
      }
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
