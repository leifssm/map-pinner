/// <reference lib="deno.unstable" />

import { Application } from "oak";
import { oakCors } from "cors";
import { router } from "@/routes.ts";
import { logger } from "~/helpers.ts";
import * as cron from "~/cron/index.ts";

const app = new Application();
app
  .use(oakCors())
  .use(router.routes())
  .use(router.allowedMethods());


app.addEventListener("listen", ({ hostname, port, secure }) => {
  logger.info(
    `Listening on: ${secure ? "https://" : "http://"}${
      hostname ?? "localhost"
    }:${port}`,
  );
});

cron.start();

await app.listen({ port: 8000 });
