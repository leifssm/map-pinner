import { Application, Router } from "https://deno.land/x/oak/mod.ts";
import { oakCors } from "https://deno.land/x/cors/mod.ts";
import data from "./data.json" assert { type: "json" };

const router = new Router();
router
  .get("/", ctx => {
    ctx.response.body = "Hello:)";
  })
  .get("/api", ctx => {
    ctx.response.body = data;
  })
  .get("/api/:dino", ctx => {
    console.log(ctx.params?.dino);
    const dino = data.find(dino => dino.name === ctx.params?.dino.toLowerCase())
    ctx.response.body = dino ?? null;
  })

const app = new Application();
app
  .use(oakCors())
  .use(router.routes())
  .use(router.allowedMethods());


app.addEventListener("listen", ({ hostname, port, secure }) => {
  console.log(
    `Listening on: ${secure ? "https://" : "http://"}${
      hostname ?? "localhost"
    }:${port}`,
  );
});
  

await app.listen({ port: 8000 });
