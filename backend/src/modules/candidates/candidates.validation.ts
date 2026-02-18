import { z } from 'zod';

export const updateProfileSchema = z.object({
  fullName: z.string().min(2).optional(),
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
