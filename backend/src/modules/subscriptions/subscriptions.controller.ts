import { Request, Response } from 'express';
import * as subService from './subscriptions.service';
import db from '../../config/database';

async function getEmployerId(req: Request): Promise<string> {
  const userId = (req as any).user?.id;
  const result = await db.query('SELECT id FROM employers WHERE user_id = $1', [userId]);
  if (result.rows.length === 0) throw new Error('Employer profile not found');
  return result.rows[0].id;
}

export const createCheckout = async (req: Request, res: Response) => {
  try {
    const employerId = await getEmployerId(req);
    const { planType } = req.body;
    if (!['PROFESSIONAL', 'ENTERPRISE'].includes(planType)) {
      return res.status(400).json({ success: false, message: 'Invalid plan type' });
    }
    const result = await subService.createCheckoutSession(employerId, planType);
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getStatus = async (req: Request, res: Response) => {
  try {
    const employerId = await getEmployerId(req);
    const status = await subService.getSubscriptionStatus(employerId);
    res.json({ success: true, data: status });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const verifySession = async (req: Request, res: Response) => {
  try {
    const employerId = await getEmployerId(req);
    const { sessionId } = req.body;
    if (!sessionId) {
      return res.status(400).json({ success: false, message: 'Session ID required' });
    }
    const result = await subService.verifyCheckoutSession(sessionId, employerId);
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const cancelSubscription = async (req: Request, res: Response) => {
  try {
    const employerId = await getEmployerId(req);
    const result = await subService.cancelSubscription(employerId);
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};
