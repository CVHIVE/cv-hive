import { Request, Response } from 'express';
import * as jobService from './jobs.service';
import { getSimilarJobs } from '../../services/recommendations.service';

export const createJob = async (req: Request, res: Response) => {
  try {
    const employer = await getEmployerId(req);
    const job = await jobService.createJob(employer, req.body);
    res.status(201).json({ success: true, data: job });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const updateJob = async (req: Request, res: Response) => {
  try {
    const employer = await getEmployerId(req);
    const job = await jobService.updateJob(req.params.id, employer, req.body);
    res.json({ success: true, data: job });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getJob = async (req: Request, res: Response) => {
  try {
    const job = await jobService.getJobById(req.params.id);
    res.json({ success: true, data: job });
  } catch (error: any) {
    res.status(404).json({ success: false, message: error.message });
  }
};

export const searchJobs = async (req: Request, res: Response) => {
  try {
    const result = await jobService.searchJobs(req.query);
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getRecentJobs = async (req: Request, res: Response) => {
  try {
    const jobs = await jobService.getRecentJobs(6);
    res.json({ success: true, data: jobs });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getEmployerJobs = async (req: Request, res: Response) => {
  try {
    const employer = await getEmployerId(req);
    const jobs = await jobService.getEmployerJobs(employer);
    res.json({ success: true, data: jobs });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const closeJob = async (req: Request, res: Response) => {
  try {
    const employer = await getEmployerId(req);
    const job = await jobService.closeJob(req.params.id, employer);
    res.json({ success: true, data: job });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const applyToJob = async (req: Request, res: Response) => {
  try {
    const candidate = await getCandidateId(req);
    const application = await jobService.applyToJob(req.params.id, candidate, req.body.coverLetter);
    res.status(201).json({ success: true, data: application });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getApplicationsForJob = async (req: Request, res: Response) => {
  try {
    const employer = await getEmployerId(req);
    const applications = await jobService.getApplicationsForJob(req.params.id, employer);
    res.json({ success: true, data: applications });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getCandidateApplications = async (req: Request, res: Response) => {
  try {
    const candidate = await getCandidateId(req);
    const applications = await jobService.getCandidateApplications(candidate);
    res.json({ success: true, data: applications });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const saveJob = async (req: Request, res: Response) => {
  try {
    const candidate = await getCandidateId(req);
    const result = await jobService.saveJob(req.params.id, candidate);
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const unsaveJob = async (req: Request, res: Response) => {
  try {
    const candidate = await getCandidateId(req);
    const result = await jobService.unsaveJob(req.params.id, candidate);
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getSavedJobs = async (req: Request, res: Response) => {
  try {
    const candidate = await getCandidateId(req);
    const jobs = await jobService.getSavedJobs(candidate);
    res.json({ success: true, data: jobs });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const updateApplicationStatus = async (req: Request, res: Response) => {
  try {
    const employer = await getEmployerId(req);
    const result = await jobService.updateApplicationStatus(
      req.params.applicationId, employer, req.body.status, req.body.notes
    );
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getApplicationStatusHistory = async (req: Request, res: Response) => {
  try {
    const employer = await getEmployerId(req);
    const history = await jobService.getApplicationStatusHistory(req.params.applicationId, employer);
    res.json({ success: true, data: history });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const payForJob = async (req: Request, res: Response) => {
  try {
    const employer = await getEmployerId(req);
    const job = await jobService.payForJob(req.params.id, employer);
    res.json({ success: true, message: 'Payment successful. Job is now active.', data: job });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getSimilarJobsHandler = async (req: Request, res: Response) => {
  try {
    const jobs = await getSimilarJobs(req.params.id);
    res.json({ success: true, data: jobs });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Helpers to get employer/candidate ID from the authenticated user
import db from '../../config/database';

async function getEmployerId(req: Request): Promise<string> {
  const userId = (req as any).user?.id;
  const result = await db.query('SELECT id FROM employers WHERE user_id = $1', [userId]);
  if (result.rows.length === 0) throw new Error('Employer profile not found');
  return result.rows[0].id;
}

async function getCandidateId(req: Request): Promise<string> {
  const userId = (req as any).user?.id;
  const result = await db.query('SELECT id FROM candidates WHERE user_id = $1', [userId]);
  if (result.rows.length === 0) throw new Error('Candidate profile not found');
  return result.rows[0].id;
}
