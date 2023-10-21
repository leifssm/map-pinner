/// <reference lib="deno.unstable" />

import { Application } from "https://deno.land/x/oak@v12.6.1/mod.ts";
import { oakCors } from "https://deno.land/x/cors@v1.2.2/mod.ts";
import { router } from "./routes.ts";
import { logger } from "./lib/helpers.ts";

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
  

await app.listen({ port: 8000 });
