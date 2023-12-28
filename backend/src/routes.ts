import { Router } from "oak";
import { router as locationRouter } from "@/routes/location/router.ts";
import { router as usersRouter } from "@/routes/users/router.ts";
import { errorMiddleware } from "~/middleware/error_middleware.ts";
import { stateMiddleware } from "~/middleware/param_middleware.ts";
import { RouterState } from "@/types.ts";
import { applyBody } from "~/helpers.ts";

const v1Router = new Router<RouterState>()
  .use(
    "/location",
    locationRouter.routes(),
    locationRouter.allowedMethods(),
  )
  .use(
    "/users",
    usersRouter.routes(),
    usersRouter.allowedMethods(),
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
