import { Request, Response } from 'express';
import * as analyticsService from '../../services/analytics.service';
import db from '../../config/database';

async function getEmployerId(req: Request): Promise<string> {
  const userId = (req as any).user?.id;
  const result = await db.query('SELECT id FROM employers WHERE user_id = $1', [userId]);
  if (result.rows.length === 0) throw new Error('Employer profile not found');
  return result.rows[0].id;
}

export const getDashboardAnalytics = async (req: Request, res: Response) => {
  try {
    const employerId = await getEmployerId(req);
    const data = await analyticsService.getEmployerDashboardAnalytics(employerId);
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getJobAnalytics = async (req: Request, res: Response) => {
  try {
    const employerId = await getEmployerId(req);
    const data = await analyticsService.getJobAnalytics(req.params.jobId, employerId);
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};
