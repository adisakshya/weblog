// Route manifest check: every legacy public route must exist in the static build (except documented removals).
//   node scripts/check-dist.mjs [distDir]
import { existsSync, readFileSync } from "node:fs";
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
for (const f of ["404.html", ".nojekyll"]) if (!existsSync(join(dist, f))) failures.push(`/${f}`);
console.log(
  `routes present: ${ok}/${legacy.length - Object.keys(removed).length - Object.keys(pending).length} (removed by design: ${Object.keys(removed).length}, pending: ${Object.keys(pending).length})`,
);
if (failures.length) {
  console.error("MISSING:\n" + failures.join("\n"));
  process.exit(1);
}
