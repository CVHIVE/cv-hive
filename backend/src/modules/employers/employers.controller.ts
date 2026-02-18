import { Request, Response } from 'express';
import * as employerService from './employers.service';

export const getProfile = async (req: Request, res: Response) => {
  try {
    const profile = await employerService.getProfile((req as any).user.id);
    res.status(200).json({ success: true, data: profile });
  } catch (error: any) {
    res.status(404).json({ success: false, message: error.message });
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const updated = await employerService.updateProfile((req as any).user.id, req.body);
    res.status(200).json({ success: true, message: 'Profile updated', data: updated });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const uploadLogo = async (req: Request, res: Response) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
    const logoUrl = `/uploads/${req.file.filename}`;
    const updated = await employerService.updateLogo((req as any).user.id, logoUrl);
    res.json({ success: true, data: updated });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getPublicProfile = async (req: Request, res: Response) => {
  try {
    const profile = await employerService.getPublicProfile(req.params.slug);
    res.json({ success: true, data: profile });
  } catch (error: any) {
    res.status(404).json({ success: false, message: error.message });
  }
};
