import { z } from 'zod';

export const updateCompanySchema = z.object({
  companyName: z.string().min(2).optional(),
  industry: z.string().optional(),
});
