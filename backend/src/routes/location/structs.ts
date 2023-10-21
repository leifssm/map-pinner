import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts'

export const locationStruct = z.object({
  lat: z.number(),
  lon: z.number(),
  timestamp: z.number(),
})

export const addLocationBodyStruct = locationStruct
export type AddLocationBodyStruct = z.infer<typeof addLocationBodyStruct>

export const addLocationReturnStruct = addLocationBodyStruct.array()
export type AddLocationReturnStruct = z.infer<typeof addLocationReturnStruct>

export const getLocationsReturnStruct = addLocationBodyStruct.array()
export type GetLocationsStruct = z.infer<typeof getLocationsReturnStruct>
