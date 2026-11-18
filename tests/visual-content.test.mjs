// The visual gate must not turn red when the owner ADDS content (articles, books, tags), and must never relax when
// baseline content is removed or when a content-independent shot regresses.
//   node --test tests/visual-content.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { contentAdditions } = require("../scripts/compare-visual.cjs");
const { PNG } = require("pngjs");
const baseline = JSON.parse(readFileSync("docs/redesign/visual-baseline.json", "utf8"));

test("contentAdditions: identical -> {}, pure additions -> listed, any removal/rename -> null", () => {
  assert.deepEqual(contentAdditions(baseline, baseline), {});
  const plus = {
    ...baseline,
    posts: [...baseline.posts, "2099-01-01-x.md"],
    books: [...baseline.books, "b"],
  };
  assert.deepEqual(contentAdditions(baseline, plus), { posts: ["2099-01-01-x.md"], books: ["b"] });
  assert.equal(contentAdditions(baseline, { ...baseline, posts: baseline.posts.slice(1) }), null);
  assert.equal(
    contentAdditions(baseline, { ...baseline, posts: [...baseline.posts.slice(1), "renamed.md"] }),
    null,
    "a renamed original post is a removal plus an addition and must not relax the gate",
  );
  assert.equal(contentAdditions(baseline, { ...baseline, videos: [] }), null);
});

// ---- the CLI, with the reference compared against itself (all shots identical) -----------------------------------
const tmp = mkdtempSync(join(tmpdir(), "weblog-visual-content-"));
const withContent = (extra) => {
  const root = mkdtempSync(join(tmp, "root-"));
  for (const d of ["_posts", "_pages", "_data"]) cpSync(d, join(root, d), { recursive: true });
  extra?.(root);
  return root;
};
const addArticle = (root) =>
  writeFileSync(
    join(root, "_posts/2099-01-01-new.md"),
    "---\ntitle: New\ndate: 2099-01-01\n---\nBody\n",
  );
const shots = (blank = []) => {
  const dir = mkdtempSync(join(tmp, "shots-"));
  cpSync("reference/screenshots", dir, { recursive: true });
  for (const f of blank) {
    const png = PNG.sync.read(readFileSync(join(dir, f)));
    png.data.fill(255);
    writeFileSync(join(dir, f), PNG.sync.write(png));
  }
  return dir;
};
const run = (dir, root, mode = "structural") =>
  spawnSync(
    process.execPath,
    ["scripts/compare-visual.cjs", dir, "--mode", mode, "--content-root", root],
    { encoding: "utf8" },
  );

test("unchanged content: nothing is skipped, a blank home page fails", () => {
  const r = run(shots(), withContent());
  assert.equal(r.status, 0, r.stdout);
  assert.doesNotMatch(r.stdout, /SKIP|NOTE content added/);
  const bad = run(shots(["home-posts--desktop.png"]), withContent());
  assert.equal(bad.status, 1, "a blank home page must fail when no content was added");
});

test("content added: home/tag/series/panel shots are skipped by name, and the run still passes", () => {
  const r = run(
    shots(["home-posts--desktop.png", "ui-search-open--mobile.png"]),
    withContent(addArticle),
  );
  assert.equal(r.status, 0, r.stdout);
  assert.match(
    r.stdout,
    /NOTE content added since the approved reference \(posts: 2099-01-01-new\.md\)/,
  );
  assert.match(r.stdout, /SKIP home-posts--desktop\.png/);
  assert.match(r.stdout, /SKIP tag-kong--mobile\.png/);
  assert.match(r.stdout, /14 content-dependent shots skipped/);
});

test("content added: article pages, themes, Contact, Terms and 404 stay mandatory", () => {
  for (const f of [
    "post-introduction-to-api-gateway--desktop.png",
    "theme-paper--desktop.png",
    "theme-batman--mobile.png",
    "page-contact--desktop.png",
    "page-terms--mobile.png",
    "not-found--desktop.png",
  ]) {
    const r = run(shots([f]), withContent(addArticle));
    assert.equal(r.status, 1, `${f} must still be compared after content was added\n${r.stdout}`);
    assert.match(r.stdout, new RegExp(`DIFF ${f.replace(".", "\\.")}`));
  }
});

test("removing baseline content never skips anything", () => {
  const root = withContent((r) => {
    addArticle(r);
    rmSync(join(r, "_posts", baseline.posts[0]));
  });
  const r = run(shots(["home-posts--desktop.png"]), root);
  assert.equal(r.status, 1, r.stdout);
  assert.doesNotMatch(r.stdout, /SKIP/);
});

test("cleanup", () => rmSync(tmp, { recursive: true, force: true }));
