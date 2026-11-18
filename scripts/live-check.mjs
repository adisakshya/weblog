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

const markers = {
  "/weblog/": "The blog of Adisakshya Chauhan",
  "/weblog/about/": "About",
  "/weblog/contact/": "Contact",
  "/weblog/terms/": "Terms and policies",
  "/weblog/series/api-gateway-101/": "API Gateway 101",
  "/weblog/series/blogging-101/": "No articles in this series yet",
};
const routes = legacy.filter(
  (r) => !removed.includes(r) && !r.startsWith("/weblog/assets/") && r !== "/weblog/404.html",
);
for (const route of routes) {
  const r = await get(route);
  ok(r.status === 200, `${route} -> ${r.status} (expected 200)`);
  if (r.status !== 200) continue;
  const html = await r.text();
  ok(/<h1/.test(html), `${route} has no <h1> in the static HTML`);
  ok(!html.includes("Page not found"), `${route} serves the 404 page`);
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
