import { Middleware } from "https://deno.land/x/oak@v12.6.1/mod.ts";

export const stateMiddleware: Middleware = async (ctx, next) => {
  ctx.state.getParam = (key: string) => {
    const param = ctx.request.url.searchParams.get(key);
    return param ? JSON.parse(param) : null;
  };
  ctx.state.getBody = async () => {
    if (!ctx.request.hasBody) ctx.throw(415);
    const value = await ctx.request.body().value;
    return value ? JSON.parse(value) : null;
  }
  await next();
}