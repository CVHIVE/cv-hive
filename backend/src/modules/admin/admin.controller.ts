import { Request, Response } from 'express';
import * as adminService from './admin.service';
import { cleanupDemoAccounts } from '../../../scripts/cleanup-demo-accounts';

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

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }
    const user = await adminService.resetPassword(req.params.id, newPassword);
    res.json({ success: true, message: `Password reset for ${user.email}` });
  } catch (error: any) {
    res.status(404).json({ success: false, message: error.message });
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
