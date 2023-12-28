import { Middleware, httpErrors } from "oak";

export const stateMiddleware: Middleware = async (ctx, next) => {
  ctx.state.getParam = (key: string) => {
    const param = ctx.request.url.searchParams.get(key);
    return param ? JSON.parse(param) : null;
  };
  ctx.state.getBody = async () => {
    if (!ctx.request.hasBody) throw new httpErrors.UnsupportedMediaType();
    const value = await ctx.request.body().value;
    return value ? JSON.parse(value) : null;
  }
  await next();
}