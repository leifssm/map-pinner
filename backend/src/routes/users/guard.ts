import { GuardOptions } from "~/middleware/guard_middleware.ts";
import { logInBodyStruct, logInReturnStruct, signInBodyStruct, signInReturnStruct } from "./structs.ts";

export const signInGuard = {
  body: signInBodyStruct,
  return: signInReturnStruct,
} satisfies GuardOptions

export type SignInGuard = typeof signInGuard

export const logInGuard = {
  body: logInBodyStruct,
  return: logInReturnStruct,
} satisfies GuardOptions

export type LogInGuard = typeof logInGuard