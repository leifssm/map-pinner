import type { Context, Next } from "https://deno.land/x/oak@v12.6.1/mod.ts";
import type { GuardOptions } from "./lib/middleware/guard_middleware.ts";
import type { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import type { ZodTypeAny } from "https://deno.land/x/zod@v3.22.4/types.ts";

export type Prettify<T> = {
  [K in keyof T]: T[K]
// deno-lint-ignore ban-types
} & {};

export interface Stringable {
  toString(): string;
}

export interface RouterState {
  body: unknown;
}

export type PromiseOrAwaited<T> = T | Promise<T>;