import { GuardOptions } from "../../lib/middleware/guard_middleware.ts";
import { addLocationBodyStruct, getLocationsReturnStruct } from "./structs.ts";

export const addLocationGuard = {
  body: addLocationBodyStruct,
} satisfies GuardOptions

export type AddLocationGuard = typeof addLocationGuard

export const getLocationsGuard = {
  return: getLocationsReturnStruct,
} satisfies GuardOptions

export type GetLocationsGuard = typeof getLocationsGuard
