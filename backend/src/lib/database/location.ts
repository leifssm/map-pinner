import { AddLocationBodyStruct } from "../../routes/location/structs.ts";
import { logger } from "../helpers.ts";
import { Branch } from "./main.ts";

type Location = AddLocationBodyStruct;

export const middleware = new Branch()
  .add("getLocations", async ({ kv }) => {
    const item = await kv.get<Location[]>(["locations"]);
    const list = item.value ?? [];
    return list;
  })
  .add("addLocation", async ({ kv, branch }, location: Location) => {
    const locations = await branch.getLocations()
    locations.push(location);
    return await kv.set(["locations"], locations);
  })
  .add("filterLocations", async ({ kv, branch }) => {
    const locations = await branch.getLocations();
    const oldest = Date.now() - 1000 * 60 * 60 * 24;
    const filtered = locations.filter(({ timestamp }) => timestamp > oldest);
    await kv.set(["locations"], filtered);
    return filtered;
  })