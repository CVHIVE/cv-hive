import { Request, Response } from 'express';
import * as alertService from './jobAlerts.service';
import db from '../../config/database';

async function getCandidateId(req: Request): Promise<string> {
  const userId = (req as any).user?.id;
  const result = await db.query('SELECT id FROM candidates WHERE user_id = $1', [userId]);
  if (result.rows.length === 0) throw new Error('Candidate profile not found');
  return result.rows[0].id;
}

export const getAlerts = async (req: Request, res: Response) => {
  try {
    const candidateId = await getCandidateId(req);
    const alerts = await alertService.getAlerts(candidateId);
    res.json({ success: true, data: alerts });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const createAlert = async (req: Request, res: Response) => {
  try {
    const candidateId = await getCandidateId(req);
    const alert = await alertService.createAlert(candidateId, req.body);
    res.status(201).json({ success: true, data: alert });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const updateAlert = async (req: Request, res: Response) => {
  try {
    const candidateId = await getCandidateId(req);
    const alert = await alertService.updateAlert(req.params.id, candidateId, req.body);
    res.json({ success: true, data: alert });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const deleteAlert = async (req: Request, res: Response) => {
  try {
    const candidateId = await getCandidateId(req);
    const result = await alertService.deleteAlert(req.params.id, candidateId);
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};
