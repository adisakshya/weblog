// Route manifest check: every legacy public route must exist in the static build (except documented removals).
//   node scripts/check-dist.mjs [distDir]
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, resolve } from "node:path";

const dist = resolve(process.argv[2] ?? "dist/client");
const legacy = JSON.parse(readFileSync("docs/inventory/legacy-routes.json", "utf8")).routes.map(
  (r) => r.route,
);
const removed = JSON.parse(
  readFileSync("docs/inventory/intentional-removals.json", "utf8"),
).removed;
const pending =
  JSON.parse(readFileSync("docs/inventory/pending-routes.json", "utf8")).pending ?? {};

const fileFor = (route) => {
  const rel = route.replace(/^\/weblog\/?/, "");
  if (rel === "" || route.endsWith("/")) return join(dist, rel, "index.html");
  return join(dist, rel);
};
const failures = [];
let ok = 0;
for (const route of legacy) {
  if (removed[route]) continue;
  if (pending[route]) continue;
  if (existsSync(fileFor(route))) ok++;
  else failures.push(route);
}
for (const f of [
  "404.html",
  ".nojekyll",
  "sitemap.xml",
  "feed.xml",
  // the आदि favicon set and the default share image (#85), shipped unchanged from docs/brand/assets
  "favicon.ico",
  "favicon.svg",
  "apple-touch-icon.png",
  "favicon-192.png",
  "favicon-512.png",
  "og-image.png",
])
  if (!existsSync(join(dist, f))) failures.push(`/${f}`);

// Every prerendered page carries exactly one og:image and one twitter:image, and the root layout none of its own, so the not-found
// page (which only has the root layout) has none (#85). Image URLs must be absolute: social crawlers ignore relative ones.
const walk = (d) =>
  readdirSync(d).flatMap((f) =>
    statSync(join(d, f)).isDirectory() ? walk(join(d, f)) : [join(d, f)],
  );
for (const f of walk(dist).filter((f) => f.endsWith(".html"))) {
  const html = readFileSync(f, "utf8");
  const og = [...html.matchAll(/<meta[^>]*property="og:image"[^>]*content="([^"]*)"/g)].map(
    (m) => m[1],
  );
  const tw = [...html.matchAll(/<meta[^>]*name="twitter:image"[^>]*content="([^"]*)"/g)].map(
    (m) => m[1],
  );
  const rel = f.slice(dist.length);
  const expected = rel === "/404.html" ? 0 : 1;
  if (og.length !== expected) failures.push(`${rel}: ${og.length} og:image (expected ${expected})`);
  if (tw.length !== expected)
    failures.push(`${rel}: ${tw.length} twitter:image (expected ${expected})`);
  for (const u of [...og, ...tw])
    if (!/^https:\/\//.test(u)) failures.push(`${rel}: relative image URL ${u}`);
}
console.log(
  `routes present: ${ok}/${legacy.length - Object.keys(removed).length - Object.keys(pending).length} (removed by design: ${Object.keys(removed).length}, pending: ${Object.keys(pending).length})`,
);
if (failures.length) {
  console.error("MISSING:\n" + failures.join("\n"));
  process.exit(1);
}
