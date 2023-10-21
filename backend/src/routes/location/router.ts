import { Router } from "https://deno.land/x/oak@v12.6.1/router.ts";
import { applyBody, logger } from "../../lib/helpers.ts";
import { RouterState } from "../../types.ts";
import { guardMiddleware } from "../../lib/middleware/guard_middleware.ts";
import * as guardMiddlewares from "./guard.ts";
import * as endpoints from "./endpoints.ts";

const router = new Router<RouterState>();
router
  .get(
    "/",
    guardMiddleware(
      guardMiddlewares.getLocationsGuard,
      endpoints.getLocations
    ),
  )
  .post(
    "/add",
    guardMiddleware(
      guardMiddlewares.addLocationGuard,
      endpoints.addLocation
    ),
  )

export { router };
