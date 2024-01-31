export type Prettify<T> = {
  [K in keyof T]: T[K];
  // deno-lint-ignore ban-types
} & {};

export interface Stringable {
  toString(): string;
}

export interface RouterState {
  body: unknown;
}

export type PromiseOrAwaited<T> = T | Promise<T>;
