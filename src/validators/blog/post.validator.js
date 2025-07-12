import { z } from 'zod';

export const createPostSchema = z.object({
  title: z.string().min(5),
  content: z.string().min(10),
  excerpt: z.string().optional(),
  categoryIds: z.array(z.number()).optional(),
  tagIds: z.array(z.number()).optional(),
});