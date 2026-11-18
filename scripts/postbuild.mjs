// Post-build for the GitHub Pages artifact (dist/client):
//  * 404.html — real server-rendered not-found page (GitHub Pages serves it for unknown paths)
//  * .nojekyll — never let Pages run Jekyll over the artifact
import { writeFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";
import { resolve } from "node:path";

const dist = resolve("dist/client");
const entry = await import(pathToFileURL(resolve("dist/server/server.js")).href);
const handler = entry.default ?? entry;
const res = await handler.fetch(new Request("http://localhost/weblog/__not_found__"));
const html = await res.text();
if (res.status !== 404 || !html.includes("Page not found")) {
  throw new Error(`404 render failed: status ${res.status}, body ${html.length} bytes`);
}
await writeFile(`${dist}/404.html`, html);
await writeFile(`${dist}/.nojekyll`, "");
console.log("postbuild: wrote 404.html and .nojekyll");
