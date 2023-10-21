import { db } from "../../lib/database/index.ts";
import { logger } from "../../lib/helpers.ts";
import { TypedMiddleware } from "../../lib/middleware/guard_middleware.ts";
import type { AddLocationGuard, GetLocationsGuard } from "./guard.ts";

const branch = db.branch.location;

export const getLocations: TypedMiddleware<GetLocationsGuard> = async () => {
  const locations = await branch.getLocations();
  logger.info("Fetched locations");
  return locations
}

export const addLocation: TypedMiddleware<AddLocationGuard> = async (ctx) => {
  await branch.addLocation(ctx.state.body);
  logger.info("Successfully added location");
  return branch.getLocations();
}
