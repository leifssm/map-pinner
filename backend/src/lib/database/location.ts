import { IdentifiedLocation, Location } from "route/location/structs.ts";
import { logger } from "~/helpers.ts";
import { Branch } from "db";

const LOCATION_LIFETIME = 1000 * 60 * 60 * 24;

export const middleware = new Branch()
  .add("getLocation", async ({ kv }, uuid: string) => {
    const location = await kv.get<Location>(["locations", uuid]);
    if (!location.value) return null;
    return {
      ...location.value,
      id: uuid,
    }
  })
  .add("getLocations", async ({ kv }) => {
    const items = await kv.list<Location>({ prefix: ["locations"] });
    const locations: IdentifiedLocation[] = []
    for await (const location of items) {
      locations.push({
        ...location.value,
        id: location.key[1] as string,
      });
    }
    return locations;
  })
  .add("getAllLocationKeys", async ({ kv }) => {
    const items = await kv.list<Location>({ prefix: ["locations"] });
    const locations: string[] = []
    for await (const location of items) {
      locations.push(location.key[1] as string);
    }
    return locations;
  })
  .add("findLocation",async ({ kv }, uuid: string) => {
    const a = await kv.get<IdentifiedLocation>(["locations", uuid]);
    return a.value;
  })
  .add("addLocation", async ({ kv, branch }, location: Location) => {
    let uuid = crypto.randomUUID();
    while (await branch.findLocation(uuid)) uuid = crypto.randomUUID()
    return await kv.set(
      ["locations", crypto.randomUUID()],
      location,
      // {
      //   expireIn: LOCATION_LIFETIME,
      // }
    );
  })
  .add("deleteLocations", async ({ kv }, uuids: string[]) => {
    const promises = [];
    for (const key of uuids) promises.push(kv.delete(["locations", key]));
    await Promise.allSettled(promises);
  })
  .add("clearLocations", async ({ branch }) => {
    const keys = await branch.getAllLocationKeys();
    await branch.deleteLocations(keys);
    logger.warn("Cleared locations");
  })
  .add("filterLocations", async ({ branch }) => {
    const locations = await branch.getLocations();
    const oldest = Date.now() - LOCATION_LIFETIME;
    const markedForDeletion = locations
      .filter(({ timestamp }) => timestamp <= oldest)
      .map(({ id }) => id);
    await branch.deleteLocations(markedForDeletion)
  })