// Local static server that mimics GitHub Pages for a project site at /weblog/:
//  * files are served as-is, a directory without trailing slash 301s to the slash form, directories serve index.html
//  * everything else gets 404.html with status 404; paths outside /weblog/ are 404 too (like Pages)
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, normalize, resolve, sep } from "node:path";

const root = resolve(process.env.DIST ?? "dist/client");
const base = "/weblog";
const port = Number(process.env.PORT ?? 4300);
const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css",
  ".js": "text/javascript",
  ".json": "application/json",
  ".xml": "application/xml",
  ".ico": "image/x-icon",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".txt": "text/plain",
};

async function notFound(res) {
  const body = await readFile(join(root, "404.html")).catch(() => Buffer.from("404"));
  res.writeHead(404, { "content-type": types[".html"] }).end(body);
}

createServer(async (req, res) => {
  try {
    const url = new URL(req.url ?? "/", "http://x");
    const p = decodeURIComponent(url.pathname);
    if (p === "/") return void res.writeHead(404).end();
    if (p !== base && !p.startsWith(base + "/")) return void (await notFound(res));
    const rel = normalize(p.slice(base.length) || "/");
    let file = join(root, rel);
    if (file !== root && !file.startsWith(root + sep)) return void (await notFound(res));
    let st = await stat(file).catch(() => null);
    if (st?.isDirectory()) {
      if (!p.endsWith("/"))
        return void res.writeHead(301, { location: p + "/" + url.search }).end();
      file = join(file, "index.html");
      st = await stat(file).catch(() => null);
    }
    if (!st?.isFile()) return void (await notFound(res));
    res
      .writeHead(200, { "content-type": types[extname(file)] ?? "application/octet-stream" })
      .end(await readFile(file));
  } catch (e) {
    res.writeHead(500).end(String(e));
  }
}).listen(port, "127.0.0.1", () =>
  console.log(`serving ${root} at http://127.0.0.1:${port}${base}/`),
);
