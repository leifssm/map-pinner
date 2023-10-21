import { Router } from "https://deno.land/x/oak@v12.6.1/mod.ts";
import { router as locationRouter } from "./routes/location/router.ts";
import { errorMiddleware } from "./lib/middleware/error_middleware.ts";
import { stateMiddleware } from "./lib/middleware/param_middleware.ts";
import { RouterState } from "./types.ts";
import { applyBody } from "./lib/helpers.ts";

const v1Router = new Router<RouterState>()
  .use(
    "/location",
    locationRouter.routes(),
    locationRouter.allowedMethods(),
  )

export const router = new Router<RouterState>()
  .use(
    "/v1",
    errorMiddleware,
    stateMiddleware,
    v1Router.routes(),
    v1Router.allowedMethods(),
  )
  .get("/health", ctx => {
    applyBody(ctx, "ok");
  });
