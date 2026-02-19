import { Request, Response } from 'express';
import * as adminService from './admin.service';
import { cleanupDemoAccounts } from '../../services/cleanup.service';

export const cleanupDemos = async (req: Request, res: Response) => {
  try {
    const result = await cleanupDemoAccounts();
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await adminService.getAllUsers();
    res.json({ success: true, data: users });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getUserById = async (req: Request, res: Response) => {
  try {
    const user = await adminService.getUserById(req.params.id);
    res.json({ success: true, data: user });
  } catch (error: any) {
    res.status(404).json({ success: false, message: error.message });
  }
};

export const getAllCandidates = async (req: Request, res: Response) => {
  try {
    const candidates = await adminService.getAllCandidates();
    res.json({ success: true, data: candidates });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllEmployers = async (req: Request, res: Response) => {
  try {
    const employers = await adminService.getAllEmployers();
    res.json({ success: true, data: employers });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllJobs = async (req: Request, res: Response) => {
  try {
    const jobs = await adminService.getAllJobs();
    res.json({ success: true, data: jobs });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const deleted = await adminService.deleteUser(req.params.id);
    res.json({ success: true, message: `User ${deleted.email} deleted` });
  } catch (error: any) {
    res.status(404).json({ success: false, message: error.message });
  }
};

export const getPlatformStats = async (req: Request, res: Response) => {
  try {
    const stats = await adminService.getPlatformStats();
    res.json({ success: true, data: stats });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getRecentActivity = async (req: Request, res: Response) => {
  try {
    const activity = await adminService.getRecentActivity();
    res.json({ success: true, data: activity });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateJobStatus = async (req: Request, res: Response) => {
  try {
    const { status } = req.body;
    if (!status) return res.status(400).json({ success: false, message: 'Status is required' });
    const job = await adminService.updateJobStatus(req.params.id, status);
    res.json({ success: true, data: job });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const updateEmployerSubscription = async (req: Request, res: Response) => {
  try {
    const { planType } = req.body;
    if (!planType) return res.status(400).json({ success: false, message: 'Plan type is required' });
    const result = await adminService.updateEmployerSubscription(req.params.id, planType);
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};
