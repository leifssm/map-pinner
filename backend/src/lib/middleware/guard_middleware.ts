import { Status } from "std/http/http_status.ts";
import { Context, Middleware, type Next, httpErrors } from "oak";
import type { ZodTypeAny, z } from "zod"; 
import { applyBody, logger } from "~/helpers.ts";
import { PromiseOrAwaited } from "@/types.ts";

export interface GuardOptions {
  body?: z.ZodTypeAny;
  return?: z.ZodTypeAny;
}

export type UnwrappedGuardValue<Options extends GuardOptions | undefined, Key extends keyof GuardOptions,> =
  Options extends GuardOptions
    ? Options[Key] extends ZodTypeAny
      ? z.infer<Options[Key]>
      : undefined | void
    : undefined;


export type TypedMiddleware<Options extends GuardOptions | undefined = undefined> = (
  context:
    Context<{
      body: UnwrappedGuardValue<Options, "body">;
      // db: typeof db;
    }>,
  next: Next
) => PromiseOrAwaited<UnwrappedGuardValue<Options, "return">>;

type ParseZod<T> = T extends ZodTypeAny ? z.infer<T> : undefined;

export const guardMiddleware = <T extends GuardOptions>(options: T, controller?: TypedMiddleware<T>): Middleware<{ body: ParseZod<T["body"]>}> => {
  return async (ctx, next) => {
    if (options.body) {
      if (!ctx.request.hasBody) throw new httpErrors.BadRequest("Missing body");
      const body = await ctx.request.body({ type: "json" }).value;
      const parsedBody = options.body.safeParse(body);
      if (!parsedBody.success) {
        logger.info("zoderror:")
        throw new httpErrors.BadRequest(parsedBody.error.toString());
      }
      // @ts-ignore - should be fine
      ctx.state.body = parsedBody.data;
    }
    if (!controller) {
      await next();
      return;
    }
    // @ts-ignore - should be fine
    const returnValue = await controller(ctx, next);
    if (options.return) {
      const parsedReturn = options.return.safeParse(returnValue);
      if (!parsedReturn.success) throw new httpErrors.InternalServerError(parsedReturn.error.toString());
      applyBody(ctx, returnValue);
    }
    ctx.response.status = Status.OK;
  }
}