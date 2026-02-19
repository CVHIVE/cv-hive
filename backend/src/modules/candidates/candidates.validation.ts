import { z } from 'zod';
import { containsProfanity } from '../../utils/profanityFilter';

export const updateProfileSchema = z.object({
  fullName: z.string()
    .min(2, 'Full name is required')
    .refine((val) => {
      const parts = val.trim().split(/\s+/).filter((p) => p.length > 0);
      return parts.length >= 2;
    }, 'Please enter both your first name and last name')
    .refine((val) => {
      const parts = val.trim().split(/\s+/).filter((p) => p.length > 0);
      return parts.every((p) => p.length >= 2);
    }, 'Each name must be at least 2 characters long')
    .refine((val) => !containsProfanity(val), 'Name contains inappropriate language. Please enter your real name.')
    .optional(),
  phone: z.string().optional(),
  visaStatus: z.enum(['EMPLOYMENT_VISA', 'OWN_VISA', 'SPOUSE_VISA', 'FREELANCE_PERMIT', 'VISIT_VISA', 'CANCELLED_VISA']).optional(),
  currentEmirate: z.enum(['DUBAI', 'ABU_DHABI', 'SHARJAH', 'AJMAN', 'RAS_AL_KHAIMAH', 'FUJAIRAH', 'UMM_AL_QUWAIN']).optional(),
  jobTitle: z.string().optional(),
  totalExperience: z.number().int().min(0).optional(),
  salaryMin: z.number().int().min(0).optional(),
  salaryMax: z.number().int().min(0).optional(),
  availabilityStatus: z.enum(['IMMEDIATE', 'ONE_MONTH', 'TWO_TO_THREE_MONTHS', 'NOT_LOOKING']).optional(),
  profileVisible: z.boolean().optional(),
  industry: z.string().optional(),
  desiredJobTitles: z.string().optional(),
  preferredEmirate: z.enum(['DUBAI', 'ABU_DHABI', 'SHARJAH', 'AJMAN', 'RAS_AL_KHAIMAH', 'FUJAIRAH', 'UMM_AL_QUWAIN']).optional(),
  education: z.string().optional(),
  skills: z.string().optional(),
  noticePeriod: z.string().optional(),
  cvVisibility: z.enum(['PUBLIC', 'PRIVATE']).optional(),
});
