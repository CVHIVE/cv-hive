import { Request, Response } from 'express';
import * as paymentService from './payments.service';
import db from '../../config/database';

async function getEmployerId(req: Request): Promise<string> {
  const userId = (req as any).user?.id;
  const result = await db.query('SELECT id FROM employers WHERE user_id = $1', [userId]);
  if (result.rows.length === 0) throw new Error('Employer profile not found');
  return result.rows[0].id;
}

export const addPaymentMethod = async (req: Request, res: Response) => {
  try {
    const employerId = await getEmployerId(req);
    const card = await paymentService.addPaymentMethod(employerId, req.body);
    res.status(201).json({ success: true, data: card });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getPaymentMethods = async (req: Request, res: Response) => {
  try {
    const employerId = await getEmployerId(req);
    const cards = await paymentService.getPaymentMethods(employerId);
    res.json({ success: true, data: cards });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const setDefault = async (req: Request, res: Response) => {
  try {
    const employerId = await getEmployerId(req);
    const result = await paymentService.setDefaultPaymentMethod(employerId, req.params.id);
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const deletePaymentMethod = async (req: Request, res: Response) => {
  try {
    const employerId = await getEmployerId(req);
    const result = await paymentService.deletePaymentMethod(employerId, req.params.id);
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};
