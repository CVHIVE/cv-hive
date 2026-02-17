import { Request, Response } from 'express';
import * as candidateService from './candidates.service';

export const getProfile = async (req: Request, res: Response) => {
  try {
    const profile = await candidateService.getProfile((req as any).user.id);
    res.status(200).json({ success: true, data: profile });
  } catch (error: any) {
    res.status(404).json({ success: false, message: error.message });
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const updated = await candidateService.updateProfile((req as any).user.id, req.body);
    res.status(200).json({ success: true, message: 'Profile updated', data: updated });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const uploadCV = async (req: Request, res: Response) => {
  try {
    if (!(req as any).file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const updated = await candidateService.uploadCV((req as any).user.id, (req as any).file);
    res.status(200).json({ success: true, message: 'CV uploaded successfully', data: updated });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const searchCandidates = async (req: Request, res: Response) => {
  try {
    const result = await candidateService.searchCandidates(req.query);
    res.status(200).json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getPublicProfile = async (req: Request, res: Response) => {
  try {
    const profile = await candidateService.getPublicProfile(req.params.slug);
    res.status(200).json({ success: true, data: profile });
  } catch (error: any) {
    res.status(404).json({ success: false, message: error.message });
  }
};
