import * as path from 'https://deno.land/std@0.102.0/path/mod.ts';

const destination = "../frontend/src/lib/api/index.ts";

const capitalizeFirstLetter = (string: string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

// ----

const imports: string[] = [];
const content: string[] = ["export const useHealthFetcher = () => useFetcher<'ok'>(\"/health\");"];

const routes = [];

for await (const path of Deno.readDir("./src/routes")) {
  if (path.isDirectory) routes.push(path.name);
}

for await (const route of routes) {
  console.log(`Processing route ${route}`);
  
  const router = await Deno.readTextFile(`./src/routes/${route}/router.ts`);
  
  const matches = router.match(/\.(get|post)[^"'`\w]*["'][^"']+["'].*?endpoints\.\w+/gs);
  if (!matches) continue;
  
  const methods = matches.map(match => match.match(/\.(get|post)[^"'`\w]*["']([^"`']+)["'].*?endpoints\.(\w+)/s)!.slice(1,4));
  const structs = await Deno.readTextFile(`./src/routes/${route}/structs.ts`);
  
  for (const [method, endpoint, func] of methods) {
    const isFetcher = method === "get";
    const methodType = isFetcher ? "Fetcher" : "Mutation";
    const capitalizedFunc = capitalizeFirstLetter(func);
    const bodyMatch = structs.match(new RegExp(`export type (${capitalizedFunc}Body)`));
    const returnMatch = structs.match(new RegExp(`export type (${capitalizedFunc}Return)`));
    if (!bodyMatch && !returnMatch) {
      console.log(`No types found for ${func}, skipping...`);
      continue;
    }
    const types = [bodyMatch, returnMatch]
      .filter(Boolean)
      .map(r => capitalizeFirstLetter(r![1]))
      .join(", ");
    imports.push(`import { ${types} } from "@backend/routes/${route}/structs.ts";`);
    const bodyType = bodyMatch?.[1] ?? "undefined";
    const returnType = returnMatch?.[1] ?? "undefined";
    
    const withArgs = isFetcher && bodyMatch;
    content.push(`export const use${capitalizeFirstLetter(func)}${methodType} = (${withArgs ? `args?: FetcherArgs<${bodyType}>` : ""}) => use${methodType}<${returnType}, ${bodyType}>("/${route}${endpoint.replace(/\/{2,}/, "/").replace(/\/$/, "")}"${withArgs ? ", args" : ""});`);
  }
  
}

imports.sort();
content.sort();
imports.unshift("import { useFetcher, useMutation, FetcherArgs } from \"./swr-hooks\";");
const output = imports.join("\n") + '\n\n' + content.join("\n\n") + "\n";

// ----

const encoder = new TextEncoder();
const data = encoder.encode(output);
await Deno.writeFile(destination, data);

const resolvedPath = path.resolve(destination);
console.log(`Wrote to ${resolvedPath}`);

