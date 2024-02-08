
import { AssertionError } from "std/assert/assertion_error.ts";
import { type Middleware, isHttpError } from "oak";
import { display } from "~/logger.ts";

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
    display.action.error(ctx.response.status, error.message);
  }
}