import type { Response } from "oak";

export type ValidContext = {
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

const stringifyArray = (elements: unknown[]) => {
  return elements.map(element => {
    if (typeof element === "string") return element;
    return JSON.stringify(element);
  }).join(" ");
}

export const logger = {
  log: (...message: unknown[]) => (
    console.error(`%cLOG%c: ${stringifyArray(message)}`, "color: white; background-color: blue", "color: white; background-color: transparent")
  ),
  info: (...message: unknown[]) => (
    console.error(`%cINFO%c: ${stringifyArray(message)}`, "color: white; background-color: green", "color: white; background-color: transparent")
  ),
  warn: (...message: unknown[]) => (
    console.error(`%cWARN%c: ${stringifyArray(message)}`, "color: white; background-color: orange", "color: white; background-color: transparent")
  ),
  error: (...message: unknown[]) => (
    console.error(`%cERROR%c: ${stringifyArray(message)}`, "color: white; background-color: red", "color: white; background-color: transparent")
  )
}

export const getKvBranchChildren = async <T>(kv: Deno.Kv, branch: string[]) => {
  const list = kv.list<T>({ prefix: branch });
  const output = [];
  for await (const key of list) output.push(key.value);
  return output;
}
