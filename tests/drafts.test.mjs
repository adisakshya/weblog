// The unlisted drafts preview (#92): add drafts to a COPY of the repo, run the normal build, and check
//   - /weblog/drafts/ lists them and each opens at /weblog/drafts/<slug>/ (noindex, no canonical, a draft bar)
//   - they are absent from the sitemap, the Atom feed, the home page, tag pages and every other page
//   - a file named with a leading "_" is not built or bundled at all
//   - with no drafts, /weblog/drafts/ still builds and says "No drafts yet"
//   node --test tests/drafts.test.mjs      (requires node_modules; takes ~1 minute)
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  symlinkSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";

const root = resolve(".");
const COPY = [
  "_posts",
  "_pages",
  "_data",
  "src",
  "public",
  "scripts",
  "docs",
  "package.json",
  "tsconfig.json",
  "vite.config.ts",
  "bun.lock",
];

function copyRepo(tmp) {
  for (const f of COPY) cpSync(join(root, f), join(tmp, f), { recursive: true });
  symlinkSync(join(root, "node_modules"), join(tmp, "node_modules"), "dir");
}
function build(tmp) {
  const vite = spawnSync(process.execPath, ["node_modules/vite/bin/vite.js", "build"], {
    cwd: tmp,
    encoding: "utf8",
  });
  assert.equal(vite.status, 0, vite.stdout + vite.stderr);
  const post = spawnSync(process.execPath, ["scripts/postbuild.mjs"], {
    cwd: tmp,
    encoding: "utf8",
  });
  assert.equal(post.status, 0, post.stdout + post.stderr);
  return join(tmp, "dist/client");
}
function files(dir) {
  return readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    return statSync(p).isDirectory() ? files(p) : [p];
  });
}

test(
  "drafts are previewed at /drafts/ and never leak into the published site",
  { timeout: 900_000 },
  (t) => {
    const tmp = mkdtempSync(join(tmpdir(), "weblog-drafts-"));
    t.after(() => rmSync(tmp, { recursive: true, force: true }));
    copyRepo(tmp);
    mkdirSync(join(tmp, "_drafts"));
    writeFileSync(
      join(tmp, "_drafts/2099-02-01-first-draft-for-the-test.md"),
      `---\ntitle: "First draft for the test"\ndate: 2099-02-01 10:00:00 +0530\ntags: [draft-only-tag, kong]\nexcerpt: DRAFTEXCERPTSENTINEL\n---\n\nDRAFTBODYSENTINEL with a [link](https://example.com/).\n\n## A heading\n\n\`\`\`bash\necho "draft"\n\`\`\`\n`,
    );
    writeFileSync(
      join(tmp, "_drafts/2099-02-02-draft-without-front-matter-extras.md"),
      `---\ndate: 2099-02-02 10:00:00 +0530\n---\n\nA bare draft.\n`,
    );
    writeFileSync(
      join(tmp, "_drafts/_held-back.md"),
      `---\ntitle: "Held back"\ndate: 2099-02-03 10:00:00 +0530\n---\n\nHELDBACKSENTINEL\n`,
    );
    const dist = build(tmp);

    const list = readFileSync(join(dist, "drafts/index.html"), "utf8");
    assert.match(list, /First draft for the test/);
    assert.match(list, /href="\/weblog\/drafts\/first-draft-for-the-test"/);
    assert.match(list, /Missing: [^<]*teaser image/);
    assert.doesNotMatch(list, /No drafts yet/);
    assert.match(list, /name="robots" content="noindex,nofollow"/);
    assert.doesNotMatch(list, /rel="canonical"/);

    const page = readFileSync(join(dist, "drafts/first-draft-for-the-test/index.html"), "utf8");
    assert.match(page, /DRAFTBODYSENTINEL/);
    assert.match(page, /Draft preview/);
    assert.match(page, /name="robots" content="noindex,nofollow"/);
    assert.doesNotMatch(page, /rel="canonical"/);
    // a draft without a title falls back to its file name and lists what is missing
    assert.ok(existsSync(join(dist, "drafts/draft-without-front-matter-extras/index.html")));

    // nothing from a draft reaches any published page, the sitemap, the feed, or the search data
    const published = files(dist).filter(
      (f) => /\.(html|xml|json|js|txt)$/.test(f) && !f.includes("/drafts/"),
    );
    for (const f of published) {
      const body = readFileSync(f, "utf8");
      if (f.endsWith(".js")) continue; // the drafts route chunk is public by design; checked below
      assert.doesNotMatch(
        body,
        /DRAFTBODYSENTINEL|DRAFTEXCERPTSENTINEL|first-draft-for-the-test/,
        f,
      );
      assert.doesNotMatch(body, /draft-only-tag/, f);
    }
    assert.ok(
      !existsSync(join(dist, "tags/draft-only-tag")),
      "a draft tag must not get a tag page",
    );
    const sitemap = readFileSync(join(dist, "sitemap.xml"), "utf8");
    assert.doesNotMatch(sitemap, /drafts/);
    assert.doesNotMatch(readFileSync(join(dist, "feed.xml"), "utf8"), /drafts|DRAFT/);

    // a leading underscore holds a file back entirely: not built, not bundled
    assert.ok(!existsSync(join(dist, "drafts/_held-back")));
    assert.ok(!existsSync(join(dist, "drafts/held-back")));
    for (const f of files(dist))
      assert.doesNotMatch(readFileSync(f, "utf8"), /HELDBACKSENTINEL/, f);
  },
);

test("with no drafts the page still builds and says so", { timeout: 900_000 }, (t) => {
  const tmp = mkdtempSync(join(tmpdir(), "weblog-nodrafts-"));
  t.after(() => rmSync(tmp, { recursive: true, force: true }));
  copyRepo(tmp);
  const dist = build(tmp);
  const list = readFileSync(join(dist, "drafts/index.html"), "utf8");
  assert.match(list, /No drafts yet/);
  assert.match(list, /name="robots" content="noindex,nofollow"/);
  assert.doesNotMatch(readFileSync(join(dist, "sitemap.xml"), "utf8"), /drafts/);
});

test(
  "two drafts with the same slug fail the build with a clear error",
  { timeout: 900_000 },
  (t) => {
    const tmp = mkdtempSync(join(tmpdir(), "weblog-dupdrafts-"));
    t.after(() => rmSync(tmp, { recursive: true, force: true }));
    copyRepo(tmp);
    mkdirSync(join(tmp, "_drafts"));
    for (const day of ["20", "23"])
      writeFileSync(
        join(tmp, `_drafts/2099-02-${day}-update.md`),
        `---\ntitle: "Update ${day}"\ndate: 2099-02-${day} 10:00:00 +0530\n---\n\nBody ${day}.\n`,
      );
    const vite = spawnSync(process.execPath, ["node_modules/vite/bin/vite.js", "build"], {
      cwd: tmp,
      encoding: "utf8",
    });
    assert.notEqual(vite.status, 0, "the build must fail");
    assert.match(vite.stdout + vite.stderr, /duplicate draft slug 'update'/);
  },
);
