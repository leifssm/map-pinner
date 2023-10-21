import { middleware as locationMiddleware } from "./location.ts";
import { database } from "./main.ts";

const db = database
  .use("location", locationMiddleware)

export { db };
