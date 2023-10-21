const kv = await Deno.openKv();

interface MiddlewarePackage<Branch extends HydratedBranchMiddlewares = HydratedBranchMiddlewares> {
  kv: Deno.Kv;
  branch: Branch;
}

// deno-lint-ignore no-explicit-any
type Middleware<Args extends any[] = any[], R = unknown, Branch extends HydratedBranchMiddlewares = HydratedBranchMiddlewares> = (data: MiddlewarePackage<Branch>, ...args: Args) => Promise<R>;
// deno-lint-ignore no-explicit-any
type HydratedMiddleware<Args extends any[] = any[], R = unknown> = (...args: Args) => Promise<R>;

type HydrateMiddleware<M extends Middleware> = M extends Middleware<infer Args, infer R, infer Branch> ? HydratedMiddleware<Args, R> : never;

type BranchMiddlewares = Record<string, Middleware>;
type HydratedBranchMiddlewares = Record<string, HydratedMiddleware>;

type HydrateBranchMiddlewares<M extends BranchMiddlewares> = {
  [key in keyof M]: HydrateMiddleware<M[key]>
}

type DatabaseBranch = Record<string, HydratedBranchMiddlewares>;

class Database<V extends DatabaseBranch = {}> {
  readonly #branches: V;
  constructor(initial?: V) {
    this.#branches = Object.freeze(initial ?? {}) as V;
  }
  use<N extends string, M extends BranchMiddlewares>(name: N, middlewares: Branch<M>) {
    if (name in this.#branches) throw new Error(`Database branch ${name} already exists`);
    const list = middlewares.list as M;
    // @ts-ignore - this is fine
    const hydratedMiddleware: HydrateBranchMiddlewares<M> = {} satisfies HydratedBranchMiddlewares;
    for (const key in list) {
      const middleware = list[key];
      const hydrated: HydratedMiddleware = async (...args) => {
        return await middleware({ kv, branch: hydratedMiddleware}, ...args);
      }
      // @ts-ignore - this is fine
      hydratedMiddleware[key] = hydrated;
    }
    hydratedMiddleware
    return new Database<V & { [key in N]: HydrateBranchMiddlewares<M> }>({ ...this.#branches, [name]: hydratedMiddleware });
  }
  get branch() {
    return this.#branches;
  }
}

export class Branch<V extends BranchMiddlewares> {
  readonly #middlewares: V;
  constructor(initial?: V) {
    this.#middlewares = Object.freeze(initial ?? {}) as V;
  }
  // deno-lint-ignore no-explicit-any
  add<N extends string, Args extends any[] = any[], R = void>(name: N, middleware: Middleware<Args, R, HydrateBranchMiddlewares<V>>) {
    if (name in this.#middlewares) throw new Error(`Database branch ${name} already exists`);
    const newBranch = { ...this.#middlewares, [name]: middleware } as { [key in N]: Middleware<Args, R, V> } & V;
    return new Branch<{ [key in N]: Middleware<Args, R, V> } & V>(newBranch) satisfies Branch<BranchMiddlewares>;
  }
  get list() {
    return { ...this.#middlewares } as V;
  }
}

export const database = new Database();
