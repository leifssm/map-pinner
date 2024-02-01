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

export const getKvBranchChildren = async <T>(kv: Deno.Kv, branch: string[]) => {
  const list = kv.list<T>({ prefix: branch });
  const output = [];
  for await (const key of list) output.push(key.value);
  return output;
}
