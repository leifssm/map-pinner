import { GuardOptions } from "~/middleware/guard_middleware.ts";
import { addLocationBodyStruct, getLocationsReturnStruct, addLocationReturnStruct, getLocationBodyStruct, getLocationReturnStruct } from "./structs.ts";

export const addLocationGuard = {
  body: addLocationBodyStruct,
  return: addLocationReturnStruct,
} satisfies GuardOptions

export type AddLocationGuard = typeof addLocationGuard

export const getLocationsGuard = {
  return: getLocationsReturnStruct,
} satisfies GuardOptions

export type GetLocationsGuard = typeof getLocationsGuard

export const getLocationGuard = {
  body: getLocationBodyStruct,
  return: getLocationReturnStruct,
} satisfies GuardOptions

export type GetLocationGuard = typeof getLocationGuard
