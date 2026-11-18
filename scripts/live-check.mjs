// Release / post-deploy check against a deployed (or locally served) site.
//   node scripts/live-check.mjs https://adisakshya.github.io        (production)
//   node scripts/live-check.mjs http://127.0.0.1:4300                (bun run preview)
// Verifies: every legacy + new public route (200 + its own content), real 404, 301 slash redirect, feeds, sitemap URLs,
// legacy image URLs, curated covers are real JPEGs, linked assets of the home page resolve, no development files are served.
import { readFileSync } from "node:fs";

const base = (process.argv[2] ?? "").replace(/\/$/, "");
if (!/^https?:\/\//.test(base)) {
  console.error("usage: live-check.mjs <origin>");
  process.exit(2);
}
const legacy = JSON.parse(readFileSync("docs/inventory/legacy-routes.json", "utf8")).routes.map(
  (r) => r.route,
);
const removed = Object.keys(
  JSON.parse(readFileSync("docs/inventory/intentional-removals.json", "utf8")).removed,
);
const failures = [];
const ok = (cond, msg) => {
  if (!cond) {
    failures.push(msg);
    console.log(`FAIL ${msg}`);
  }
};
const get = (path, init) => fetch(base + path, { redirect: "manual", ...init });

// Each route must serve ITS OWN document: the <h1> text and canonical URL are derived from the authoritative sources
// (front-matter titles, tag/series pages), so a CDN/Pages fault that serves the home page (or any other page) at
// another URL cannot pass. The list of routes comes from the frozen legacy inventory.
const decode = (s) =>
  s
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
const text = (html) =>
  decode(
    html
      .replace(/<!--[\s\S]*?-->/g, "")
      .replace(/<[^>]+>/g, "")
      .replace(/\s+/g, " ")
      .trim(),
  );
const title = (file) => {
  const m = readFileSync(file, "utf8").match(/^title:\s*"?(.*?)"?\s*$/m);
  return m ? m[1] : null;
};
const sourceOf = Object.fromEntries(
  JSON.parse(readFileSync("docs/inventory/legacy-routes.json", "utf8")).routes.map((r) => [
    r.route,
    r.source,
  ]),
);
export function expectedH1(route) {
  if (route === "/weblog/") return "The blog of Adisakshya Chauhan";
  const tag = route.match(/^\/weblog\/tags\/([^/]+)\/$/);
  if (tag) return `#${tag[1]}`;
  const src = sourceOf[route];
  return src ? title(src) : null;
}
const markers = { "/weblog/series/blogging-101/": "No articles in this series yet" };
const routes = legacy.filter(
  (r) => !removed.includes(r) && !r.startsWith("/weblog/assets/") && r !== "/weblog/404.html",
);
for (const route of routes) {
  const r = await get(route);
  ok(r.status === 200, `${route} -> ${r.status} (expected 200)`);
  if (r.status !== 200) continue;
  const html = await r.text();
  ok(!html.includes("Page not found"), `${route} serves the 404 page`);
  const h1 = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/);
  const want = expectedH1(route);
  ok(want, `${route}: no expected title could be derived from the sources`);
  ok(h1, `${route} has no <h1> in the static HTML`);
  if (h1 && want)
    ok(text(h1[1]).includes(want), `${route}: <h1> is "${text(h1[1])}", expected "${want}"`);
  const canon = html.match(
    /<link[^>]*rel="canonical"[^>]*href="([^"]+)"|<link[^>]*href="([^"]+)"[^>]*rel="canonical"/,
  );
  const canonPath = canon ? new URL(canon[1] ?? canon[2]).pathname : null;
  ok(canonPath === route, `${route}: canonical URL is ${canonPath}, expected ${route}`);
  if (markers[route]) ok(html.includes(markers[route]), `${route} lacks "${markers[route]}"`);
}
// home must be the Posts view (a prerender regression once overwrote it with the Index view)
{
  const html = await (await get("/weblog/")).text();
  ok(
    /aria-label="Posts" aria-pressed="true"/.test(html) && html.includes("Bookshelf"),
    "/weblog/ is not the Posts view",
  );
}
// 404 + redirect semantics
{
  const r = await get("/weblog/this-page-does-not-exist/");
  ok(r.status === 404, `unknown route -> ${r.status} (expected 404)`);
  ok((await r.text()).includes("Page not found"), "404 page body missing");
  const slash = await get("/weblog/contact");
  ok(
    [301, 302].includes(slash.status) &&
      /\/weblog\/contact\/$/.test(slash.headers.get("location") ?? ""),
    `/weblog/contact does not redirect to the slash form (${slash.status})`,
  );
}
// legacy assets, covers, feeds
for (const p of [
  "/weblog/assets/images/avatar.jpg",
  "/weblog/assets/images/sun.webp",
  "/weblog/assets/images/jekyll.png",
  "/weblog/assets/favicon.ico",
  "/weblog/favicon.ico",
]) {
  const r = await get(p);
  ok(r.status === 200, `${p} -> ${r.status}`);
}
const home = await (await get("/weblog/")).text();
const covers = [
  ...new Set([...home.matchAll(/\/weblog\/curated\/[a-z-]+\.jpg/g)].map((m) => m[0])),
];
ok(covers.length === 10, `expected 10 curated covers on the home page, found ${covers.length}`);
for (const c of covers) {
  const r = await get(c);
  const b = new Uint8Array(await r.arrayBuffer());
  ok(r.status === 200 && b[0] === 0xff && b[1] === 0xd8, `${c} is not a JPEG (${r.status})`);
}
for (const f of ["/weblog/sitemap.xml", "/weblog/feed.xml"]) {
  const r = await get(f);
  ok(
    r.status === 200 && /xml/.test(r.headers.get("content-type") ?? ""),
    `${f} -> ${r.status} ${r.headers.get("content-type")}`,
  );
}
{
  const xml = await (await get("/weblog/sitemap.xml")).text();
  const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname);
  ok(urls.length >= 18, `sitemap lists only ${urls.length} URLs`);
  for (const u of urls) {
    const r = await get(u);
    ok(r.status === 200, `sitemap URL ${u} -> ${r.status}`);
  }
}
// every script/stylesheet of the home page resolves under /weblog/
for (const m of home.matchAll(/(?:src|href)="(\/weblog\/assets\/[^"]+\.(?:js|css))"/g)) {
  const r = await get(m[1]);
  ok(r.status === 200, `${m[1]} -> ${r.status}`);
}
// development files must not be published (the Jekyll site served /weblog/Gemfile)
for (const p of [
  "/weblog/Gemfile",
  "/weblog/Gemfile.lock",
  "/weblog/_config.yml",
  "/weblog/package.json",
  "/weblog/AGENTS.md",
  "/weblog/WEBLOG_RUN_LEDGER.md",
  "/weblog/.git/config",
  "/weblog/_posts/2022-02-01-introduction-to-api-gateway.md",
]) {
  const r = await get(p);
  ok(r.status === 404, `development file ${p} is served (${r.status})`);
}

console.log(
  failures.length
    ? `\n${failures.length} live-check failure(s)`
    : `live-check OK: ${routes.length} routes + 404/redirect/assets/covers/feeds/sitemap/no-dev-files on ${base}`,
);
process.exit(failures.length ? 1 : 0);
