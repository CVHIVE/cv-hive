import db from '../../config/database';
import stripe, { STRIPE_PLANS } from '../../config/stripe';
import { v4 as uuidv4 } from 'uuid';

export const createCheckoutSession = async (employerId: string, planType: 'PROFESSIONAL' | 'ENTERPRISE') => {
  const plan = STRIPE_PLANS[planType];

  if (!plan.priceId) {
    throw new Error('Stripe is not configured for this plan. Please contact support.');
  }

  // Use Stripe Checkout for secure payment
  const employer = await db.query(
    `SELECT e.id, e.company_name, u.email, u.id as user_id
     FROM employers e JOIN users u ON u.id = e.user_id WHERE e.id = $1`,
    [employerId]
  );
  if (employer.rows.length === 0) throw new Error('Employer not found');

  const emp = employer.rows[0];

  let sub = await db.query('SELECT * FROM subscriptions WHERE employer_id = $1', [employerId]);
  let customerId = sub.rows[0]?.stripe_customer_id;

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: emp.email,
      metadata: { employer_id: employerId, user_id: emp.user_id },
    });
    customerId = customer.id;

    if (sub.rows.length === 0) {
      await db.query(
        `INSERT INTO subscriptions (id, employer_id, stripe_customer_id, plan_type, contact_reveals_limit, contact_reveals_used) VALUES ($1, $2, $3, 'DEMO', 0, 0)`,
        [uuidv4(), employerId, customerId]
      );
    } else {
      await db.query(
        'UPDATE subscriptions SET stripe_customer_id = $1 WHERE employer_id = $2',
        [customerId, employerId]
      );
    }
  }

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    line_items: [{ price: plan.priceId, quantity: 1 }],
    success_url: `${process.env.FRONTEND_URL || 'http://localhost:3001'}/employer-dashboard?subscription=success&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:3001'}/pricing?subscription=cancelled`,
    metadata: { employer_id: employerId, plan_type: planType },
  });

  return { sessionId: session.id, url: session.url };
};

export const handleCheckoutComplete = async (session: any) => {
  const employerId = session.metadata?.employer_id;
  const planType = session.metadata?.plan_type;
  if (!employerId || !planType) return;

  const plan = STRIPE_PLANS[planType as keyof typeof STRIPE_PLANS];
  const subscriptionId = session.subscription;

  await db.query(
    `UPDATE subscriptions SET
      plan_type = $1, status = 'ACTIVE', stripe_subscription_id = $2,
      contact_reveals_limit = $3, contact_reveals_used = 0,
      current_period_start = NOW(), current_period_end = NOW() + INTERVAL '30 days'
     WHERE employer_id = $4`,
    [planType, subscriptionId, plan.contactRevealsLimit, employerId]
  );
};

export const handleSubscriptionUpdated = async (subscription: any) => {
  const result = await db.query(
    'SELECT * FROM subscriptions WHERE stripe_subscription_id = $1',
    [subscription.id]
  );
  if (result.rows.length === 0) return;

  const status = subscription.status === 'active' ? 'ACTIVE' :
                 subscription.status === 'past_due' ? 'PAST_DUE' : 'CANCELLED';

  await db.query(
    `UPDATE subscriptions SET status = $1, cancel_at_period_end = $2,
     current_period_start = to_timestamp($3), current_period_end = to_timestamp($4)
     WHERE stripe_subscription_id = $5`,
    [status, subscription.cancel_at_period_end || false,
     subscription.current_period_start, subscription.current_period_end,
     subscription.id]
  );
};

export const handleSubscriptionDeleted = async (subscription: any) => {
  await db.query(
    `UPDATE subscriptions SET status = 'CANCELLED', plan_type = 'DEMO',
     contact_reveals_limit = 0, contact_reveals_used = 0
     WHERE stripe_subscription_id = $1`,
    [subscription.id]
  );
};

export const verifyCheckoutSession = async (sessionId: string, employerId: string) => {
  const session = await stripe.checkout.sessions.retrieve(sessionId);

  if (session.payment_status !== 'paid') {
    return { status: 'unpaid', plan_type: null };
  }

  const planType = session.metadata?.plan_type;
  if (!planType) {
    return { status: 'paid', plan_type: null };
  }

  // Check if already activated
  const existing = await db.query(
    'SELECT plan_type FROM subscriptions WHERE employer_id = $1',
    [employerId]
  );
  if (existing.rows[0]?.plan_type === planType) {
    return { status: 'already_active', plan_type: planType };
  }

  // Activate the subscription (same logic as webhook handler)
  await handleCheckoutComplete(session);
  return { status: 'activated', plan_type: planType };
};

export const cancelSubscription = async (employerId: string) => {
  const sub = await db.query(
    'SELECT stripe_subscription_id, plan_type FROM subscriptions WHERE employer_id = $1',
    [employerId]
  );
  if (sub.rows.length === 0 || sub.rows[0].plan_type === 'DEMO') {
    throw new Error('No active subscription found');
  }

  if (sub.rows[0].stripe_subscription_id) {
    await stripe.subscriptions.update(sub.rows[0].stripe_subscription_id, {
      cancel_at_period_end: true,
    });
  }

  await db.query(
    'UPDATE subscriptions SET cancel_at_period_end = TRUE WHERE employer_id = $1',
    [employerId]
  );

  return { message: 'Subscription will cancel at end of billing period' };
};

export const getSubscriptionStatus = async (employerId: string) => {
  const result = await db.query(
    'SELECT * FROM subscriptions WHERE employer_id = $1',
    [employerId]
  );
  if (result.rows.length === 0) {
    return { plan_type: 'DEMO', status: 'ACTIVE', contact_reveals_limit: 0, contact_reveals_used: 0 };
  }
  return result.rows[0];
};

/** Returns the active plan type for an employer: DEMO | PROFESSIONAL | ENTERPRISE */
export const getEmployerPlan = async (employerId: string): Promise<string> => {
  const result = await db.query(
    "SELECT plan_type FROM subscriptions WHERE employer_id = $1 AND status = 'ACTIVE'",
    [employerId]
  );
  return result.rows.length > 0 ? result.rows[0].plan_type : 'DEMO';
};

/** Check if employer has at least the given plan tier */
export const hasMinPlan = async (employerId: string, minPlan: 'PROFESSIONAL' | 'ENTERPRISE'): Promise<boolean> => {
  const plan = await getEmployerPlan(employerId);
  const tiers: Record<string, number> = { DEMO: 0, PROFESSIONAL: 1, ENTERPRISE: 2 };
  return (tiers[plan] ?? 0) >= (tiers[minPlan] ?? 0);
};

export const checkContactRevealLimit = async (employerId: string) => {
  const sub = await getSubscriptionStatus(employerId);
  if (sub.contact_reveals_limit <= 0) return false;
  return sub.contact_reveals_used < sub.contact_reveals_limit;
};

export const incrementContactReveal = async (employerId: string) => {
  const result = await db.query(
    'UPDATE subscriptions SET contact_reveals_used = contact_reveals_used + 1 WHERE employer_id = $1',
    [employerId]
  );
  if (result.rowCount === 0) {
    await db.query(
      `INSERT INTO subscriptions (id, employer_id, plan_type, status, contact_reveals_limit, contact_reveals_used)
       VALUES ($1, $2, 'DEMO', 'ACTIVE', 0, 1)`,
      [uuidv4(), employerId]
    );
  }
};
