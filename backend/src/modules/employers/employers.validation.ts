import { z } from 'zod';

export const updateCompanySchema = z.object({
  companyName: z.string().min(2).optional(),
  industry: z.string().optional(),
  description: z.string().max(2000).optional(),
  website: z.string().max(500).optional(),
  companySize: z.string().optional(),
  foundedYear: z.number().int().min(1900).max(2100).optional(),
  location: z.string().max(255).optional(),
});
