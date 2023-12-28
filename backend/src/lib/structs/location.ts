import { z } from "zod";

const dateThreshold = {
  min: 1000 * 60 * 15,
  max: 1000 * 60 * 5
};

export const locationStruct = z.object({
  description: z.string(),
  anchor: z.tuple([z.number(), z.number()]),
  timestamp: z.custom<number>(timestamp => {
    if (typeof timestamp !== "number") return false
    if (isNaN(timestamp)) return false

    const now = Date.now();
    if (now - timestamp > dateThreshold.min) return false;
    if (timestamp - now > dateThreshold.max) return false;
    return true;
  }, { message: "Timestamp is either too outdated or has not yet passed" } ), 
})
export type Location = z.infer<typeof locationStruct>
