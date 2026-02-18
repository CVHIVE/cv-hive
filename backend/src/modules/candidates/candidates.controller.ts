import { Request, Response } from 'express';
import * as candidateService from './candidates.service';
import { checkContactRevealLimit, incrementContactReveal } from '../subscriptions/subscriptions.service';
import db from '../../config/database';

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

export const removeCV = async (req: Request, res: Response) => {
  try {
    const updated = await candidateService.removeCV((req as any).user.id);
    res.status(200).json({ success: true, message: 'CV removed', data: updated });
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

export const revealContact = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const candidateId = req.params.id;

    // Get employer ID
    const empResult = await db.query('SELECT id FROM employers WHERE user_id = $1', [userId]);
    if (empResult.rows.length === 0) {
      return res.status(403).json({ success: false, message: 'Employer profile not found' });
    }
    const employerId = empResult.rows[0].id;

    // Check if already revealed (free re-access)
    const alreadyRevealed = await candidateService.checkAlreadyRevealed(employerId, candidateId);
    if (alreadyRevealed) {
      const contactInfo = await candidateService.getCandidateContactInfo(candidateId);
      return res.json({ success: true, data: contactInfo });
    }

    // Check reveal limit
    const canReveal = await checkContactRevealLimit(employerId);
    if (!canReveal) {
      return res.status(403).json({
        success: false,
        message: 'Contact reveal limit reached. Please upgrade your plan.',
      });
    }

    // Get contact info
    const contactInfo = await candidateService.getCandidateContactInfo(candidateId);

    // Increment counter and record the reveal
    await incrementContactReveal(employerId);
    await candidateService.recordReveal(employerId, candidateId);

    res.json({ success: true, data: contactInfo });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};
