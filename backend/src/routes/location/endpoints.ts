import { db } from "storage";
import { logger } from "~/helpers.ts";
import { TypedMiddleware } from "~/middleware/guard_middleware.ts";
import type { AddLocationGuard, GetLocationGuard, GetLocationsGuard } from "./guard.ts";

const branch = db.branch.location;

export const getLocations: TypedMiddleware<GetLocationsGuard> = async () => {
  const locations = await branch.getLocations();
  logger.info(`Fetched locations (${locations.length})`);
  return locations
}

export const getLocation: TypedMiddleware<GetLocationGuard> = async (ctx) => {
  const location = await branch.getLocation(ctx.state.body.uuid);
  return location;
}

export const addLocation: TypedMiddleware<AddLocationGuard> = async (ctx) => {
  await branch.addLocation(ctx.state.body);
  logger.info("Successfully added location");
  return branch.getLocations();
}