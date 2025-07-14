import { z } from 'zod';

export const updateJobSchema = z.object({
  title: z.string().min(5).optional(),
  description: z.string().min(10).optional(),
  jobType: z.enum(['FULL_TIME', 'PART_TIME', 'INTERNSHIP']).optional(),
  categorieIds: z.array(z.number()).optional(), // Array of category IDs
  skillIds: z.array(z.number()).optional(),   // Array of skill IDs
  // ... other optional fields ...
});
