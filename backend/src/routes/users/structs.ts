import { z } from 'zod';
import { userStruct } from "~/structs/user.ts";

export const signInBodyStruct = z.object({
  email: z.string().email(),
  password: z.string()
});
export type SignInBody = z.infer<typeof signInBodyStruct>

export const signInReturnStruct = userStruct;
export type SignInReturn = z.infer<typeof signInReturnStruct>

export const logInBodyStruct = signInBodyStruct
export type LogInBody = z.infer<typeof logInBodyStruct>

export const logInReturnStruct = z.boolean();
export type LogInReturn = z.infer<typeof logInReturnStruct>
