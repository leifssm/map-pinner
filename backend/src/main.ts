/// <reference lib="deno.unstable" />

import "~/extended-promises.ts";

import { Application } from "oak";
import { oakCors } from "cors";
import { router } from "@/routes.ts";
import * as cron from "~/cron/index.ts";
import { display } from "~/logger.ts";
import "@/display.ts";

const app = new Application();
app
  .use(oakCors())
  .use(router.routes())
  .use(router.allowedMethods());


app.addEventListener("listen", ({ hostname, port, secure }) => {
  display.action.info(
    `Listening on: ${secure ? "https://" : "http://"}${
      hostname ?? "localhost"
    }:${port}`,
  );
});

cron.start();

await app.listen({ port: 8000 });
