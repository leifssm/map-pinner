import { GuardOptions } from "../../lib/middleware/guard_middleware.ts";
import { addLocationBodyStruct, getLocationsReturnStruct, addLocationReturnStruct } from "./structs.ts";

export const addLocationGuard = {
  body: addLocationBodyStruct,
  return: addLocationReturnStruct,
} satisfies GuardOptions

export type AddLocationGuard = typeof addLocationGuard

export const getLocationsGuard = {
  return: getLocationsReturnStruct,
} satisfies GuardOptions

export type GetLocationsGuard = typeof getLocationsGuard
