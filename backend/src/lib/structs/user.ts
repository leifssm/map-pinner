import { z } from "zod";

export const userStruct = z.object({
  email: z.string().email(),
  password: z.string(),
  loginAttempts: z.number().int().positive(),
  createdAt: z.number().int().positive(),
});

export type User = z.infer<typeof userStruct>;