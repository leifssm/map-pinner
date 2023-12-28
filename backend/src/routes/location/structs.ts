import { z } from "zod"
import { locationStruct } from "~/structs/location.ts";

export const addLocationBodyStruct = locationStruct.merge(z.object({
  timestamp: z.number()
}))
export type AddLocationBody = z.infer<typeof addLocationBodyStruct>

export const addLocationReturnStruct = addLocationBodyStruct.array()
export type AddLocationReturn = z.infer<typeof addLocationReturnStruct>

export const getLocationsReturnStruct = addLocationBodyStruct.array()
export type GetLocationsReturn = z.infer<typeof getLocationsReturnStruct>

export const getLocationBodyStruct = z.object({
  uuid: z.string().uuid()
});
export type GetLocationBody = z.infer<typeof getLocationBodyStruct>

export const getLocationReturnStruct = addLocationBodyStruct.nullable();
export type GetLocationReturn = z.infer<typeof getLocationReturnStruct>
