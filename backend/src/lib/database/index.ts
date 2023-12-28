import { middleware as locationMiddleware } from "./location.ts";
import { middleware as usersMiddleware } from "./users.ts";
import { database } from "db";

export const db = database
  .use("location", locationMiddleware)
  .use("users", usersMiddleware);
