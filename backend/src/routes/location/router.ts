import { Router } from "oak";
import { RouterState } from "@/types.ts";
import { guardMiddleware } from "~/middleware/guard_middleware.ts";
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
