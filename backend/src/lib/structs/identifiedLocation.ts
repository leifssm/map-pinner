import { z } from "zod";
import { locationStruct } from "~/structs/location.ts";

export const identifiedLocationStruct = locationStruct.extend({
  id: z.string().uuid(),
})
export type IdentifiedLocation = z.infer<typeof identifiedLocationStruct>
