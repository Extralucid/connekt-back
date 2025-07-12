import { z } from 'zod';

// Register validation
export const registerSchema = z.object({
    username: z.string().min(3),
    email: z.string().email(),
    password: z.string().min(6),
    displayName: z.string().optional(),
});

// Login validation
export const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
});
