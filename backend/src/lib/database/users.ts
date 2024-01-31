import * as bcrypt from "bcrypt";
import { httpErrors } from "oak";
import { getKvBranchChildren, wait } from "~/helpers.ts";
import { Branch } from "db";
import { User } from "~/structs/user.ts";
import { display } from "@/logger.ts";

const MAX_LOGIN_ATTEMPTS = 5;

export const middleware = new Branch()
  .add("stall", async () => {
    await wait(1500 + Math.random() * 1000);
  })
  .add("getUser", async ({ kv }, email: string) => {
    const user = await kv.get<User>(["users", email]);
    return user.value ?? null;
  })
  .add("userExists", async ({ branch }, email: string) => {
    const user = await branch.getUser(email);
    return !!user;
  })
  .add("addUser", async ({ kv, branch }, email: string, password: string) => {
    const userExists = await branch.userExists(email);
    if (userExists) throw new httpErrors.BadRequest("User already exists");

    const hash = await bcrypt.hash(password);
    const user: User = {
      email,
      password: hash,
      createdAt: Date.now(),
      loginAttempts: 0
    }
    await kv.set(["users", email], user);
    return user;
  })
  .add("verifyUser", async ({ kv, branch }, email: string, password: string) => {
    const user = await branch.getUser(email);
    await branch.stall();
    if (!user) return false;
    if (user.loginAttempts >= MAX_LOGIN_ATTEMPTS) throw new httpErrors.TooManyRequests("Too many login attempts");

    const matches = await bcrypt.compare(password, user.password);
    if (matches) user.loginAttempts = 0;
    else user.loginAttempts++;
    await kv.set(["users", email], user);
    return matches;
  })
  .add("deleteUser", async ({ kv }, email: string) => {
    await kv.delete(["users", email]);
  })
  .add("log", async ({ kv }) => {
    const users = await getKvBranchChildren<User>(kv, ["users"]);
    display.action.log("Users:", users);
  })