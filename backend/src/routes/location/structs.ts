import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts'

export const addLocationBodyStruct = z.object({
  lat: z.number(),
  lon: z.number(),
  timestamp: z.number(),
})
export type AddLocationBodyStruct = z.infer<typeof addLocationBodyStruct>

export const getLocationsReturnStruct = z.object({
  lat: z.number(),
  lon: z.number(),
  timestamp: z.number(),
}).array()
export type GetLocationsStruct = z.infer<typeof getLocationsReturnStruct>
