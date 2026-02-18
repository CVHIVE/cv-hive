import { z } from 'zod';

export const createJobSchema = z.object({
  title: z.string().min(3).max(255),
  description: z.string().min(20),
  industry: z.string().min(1),
  jobType: z.enum(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'FREELANCE', 'INTERNSHIP']),
  emirate: z.enum(['DUBAI', 'ABU_DHABI', 'SHARJAH', 'AJMAN', 'RAS_AL_KHAIMAH', 'FUJAIRAH', 'UMM_AL_QUWAIN']),
  salaryMin: z.number().int().min(0).optional(),
  salaryMax: z.number().int().min(0).optional(),
  salaryHidden: z.boolean().optional(),
  experienceMin: z.number().int().min(0).optional(),
  experienceMax: z.number().int().min(0).optional(),
  skills: z.string().optional(),
  status: z.enum(['ACTIVE', 'DRAFT']).optional(),
});

export const updateJobSchema = createJobSchema.partial();

export const applyJobSchema = z.object({
  coverLetter: z.string().max(2000).optional(),
});

export const updateApplicationStatusSchema = z.object({
  status: z.enum(['PENDING', 'REVIEWED', 'SHORTLISTED', 'REJECTED', 'HIRED']),
  notes: z.string().max(1000).optional(),
});
