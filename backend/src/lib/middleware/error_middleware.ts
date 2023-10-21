import { AssertionError } from "https://deno.land/std@0.200.0/assert/assertion_error.ts";
import { type Middleware, isHttpError } from "https://deno.land/x/oak@v12.6.1/mod.ts";
import { logger } from "../helpers.ts";

export const errorMiddleware: Middleware = async (ctx, next) => {
  try {
    await next()
  } catch (error) {
    if (isHttpError(error)) {
      ctx.response.status = error.status;
    } else if (error instanceof AssertionError) {
      ctx.response.status = 400;
    } else {
      ctx.response.status = 500;
    }
    ctx.response.body = { error: error.message ?? "Internal Server Error" };
    ctx.response.type = "json";
    logger.error(ctx.response.status, error.message);
  }
}