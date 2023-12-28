import { httpErrors } from "oak";
import { db } from "storage";
import { logger } from "~/helpers.ts";
import { TypedMiddleware } from "~/middleware/guard_middleware.ts";
import type { SignInGuard, LogInGuard } from "./guard.ts";

const branch = db.branch.users;

export const signIn: TypedMiddleware<SignInGuard> = async (ctx) => {
  const { email, password } = ctx.state.body;
  const user = await branch.addUser(email, password);
  logger.info(`User ${email} signed up`);
  return user;
}

export const logIn: TypedMiddleware<LogInGuard> = async (ctx) => {
  const { email, password } = ctx.state.body;
  const verified = await branch.verifyUser(email, password);
  if (!verified) throw new httpErrors.BadRequest("Invalid email or password");
  logger.info(`User ${email} logged in`);
  return verified;
}