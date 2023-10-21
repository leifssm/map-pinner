import { Response } from "https://deno.land/x/oak@v12.6.1/mod.ts";
import { Stringable } from "../types.ts";

type ValidContext = {
  response: Response;
}
export const applyBody = (ctx: ValidContext, value: unknown) => {
  ctx.response.body = {
    body: value
  };
}

export const wait = (milliseconds: number) => {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
}

export const logger = {
  log: (...message: Stringable[]) => (
    console.error(`%cLOG%c: ${message.join(" ")}`, "color: white; background-color: blue", "color: white; background-color: transparent")
  ),
  info: (...message: Stringable[]) => (
    console.error(`%cINFO%c: ${message.join(" ")}`, "color: white; background-color: green", "color: white; background-color: transparent")
  ),
  error: (...message: Stringable[]) => (
    console.error(`%cERROR%c: ${message.join(" ")}`, "color: white; background-color: red", "color: white; background-color: transparent")
  )
}