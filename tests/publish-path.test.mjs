// The documented authoring path really works: add a Markdown article and a curated book to a COPY of the repo,
// run the normal build, and check the new content appears everywhere it should (page, home, tag, sitemap, feed, search, cover).
//   node --test tests/publish-path.test.mjs      (requires node_modules; takes ~1 minute)
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  cpSync,
  existsSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { spawn, spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import { chromium } from "playwright";

const { PNG } = createRequire(import.meta.url)("pngjs");

const root = resolve(".");
const tmp = mkdtempSync(join(tmpdir(), "weblog-publish-"));
const TITLE = "Hello from the publish test";
const COVER = "publish-test-cover.png"; // PNG and WebP covers are accepted formats too, so the fixture uses both
const COVER_WEBP = "publish-test-cover.webp";
const COVER_UPPER = "Publish-Test-Cover.JPG"; // camera-style upper-case extension
const COVER_JPEG = "publish-test-cover.jpeg"; // the accepted .jpeg spelling (served as image/jpeg)
const THOUGHTS = "A reflection written by the owner";

test(
  "add an article + a curated book, build, and find them everywhere",
  { timeout: 900_000 },
  async (t) => {
    t.after(() => rmSync(tmp, { recursive: true, force: true }));
    for (const f of [
      "_posts",
      "_pages",
      "_data",
      "src",
      "public",
      "scripts",
      "docs",
      "tests",
      "reference",
      "package.json",
      "tsconfig.json",
      "vite.config.ts",
      "bun.lock",
    ]) {
      cpSync(join(root, f), join(tmp, f), { recursive: true });
    }
    symlinkSync(join(root, "node_modules"), join(tmp, "node_modules"), "dir");

    // 1. a new article: only a Markdown file with front matter (a brand-new tag needs no other file)
    writeFileSync(
      join(tmp, "_posts/2099-01-01-hello-from-the-publish-test.md"),
      `---\ntitle: "${TITLE}"\ndate: 2099-01-01 10:00:00 +0530\ntags: [publish-test, kong]\nexcerpt: A new article added by the publishing-path test.\n---\n\nFirst paragraph with a [link](https://example.com/) and it's typeset like the others.\n\n## A heading\n\n\`\`\`bash\necho "it works"\n\`\`\`\n`,
    );
    // 2. a new curated book: an image in public/curated + an entry in _data/curated-content.json (no code change)
    const png = new PNG({ width: 120, height: 180 });
    png.data.fill(200);
    writeFileSync(join(tmp, "public/curated", COVER), PNG.sync.write(png));
    cpSync(join(root, "public/assets/images/sun.webp"), join(tmp, "public/curated", COVER_WEBP));
    cpSync(join(root, "public/curated/brief-time.jpg"), join(tmp, "public/curated", COVER_JPEG));
    cpSync(join(root, "public/curated/brief-time.jpg"), join(tmp, "public/curated", COVER_UPPER));
    const dataPath = join(tmp, "_data/curated-content.json");
    const data = JSON.parse(readFileSync(dataPath, "utf8"));
    data.books.push({
      id: "publish-test",
      title: "A Test Book",
      author: "Test Author",
      cover: COVER,
      url: "https://example.com/book",
      thoughts: null,
    });
    data.books.push({
      id: "publish-test-jpeg",
      title: "A Third Test Book",
      author: "Test Author",
      cover: COVER_JPEG,
      url: "https://example.com/book3",
      thoughts: null,
    });
    data.books.push({
      id: "publish-test-upper",
      title: "A Fourth Test Book",
      author: "Test Author",
      cover: COVER_UPPER,
      url: "https://example.com/book4",
      thoughts: null,
    });
    data.books.push({
      id: "publish-test-webp",
      title: "A Second Test Book",
      author: "Test Author",
      cover: COVER_WEBP,
      url: "https://example.com/book2",
      thoughts: THOUGHTS,
    });
    writeFileSync(dataPath, JSON.stringify(data, null, 2));

    // 3. the normal build
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
    const dist = join(tmp, "dist/client");
    const read = (p) => readFileSync(join(dist, p), "utf8");

    // article page at its permalink, with content and highlighted code
    const article = "2099/01/01/hello-from-the-publish-test.html";
    assert.ok(existsSync(join(dist, article)), "article page built at /YYYY/MM/DD/slug.html");
    assert.match(read(article), new RegExp(TITLE));
    assert.match(read(article), /echo[\s\S]*it works/);
    assert.match(read(article), /it’s typeset/, "kramdown-style typography applied");
    assert.match(read("index.html"), new RegExp(TITLE), "newest article is the home page lead");
    // taxonomy: existing tag lists it; a brand-new tag gets a page
    assert.match(read("tags/kong/index.html"), new RegExp(TITLE));
    assert.ok(existsSync(join(dist, "tags/publish-test/index.html")), "new tag page built");
    assert.match(read("tags/publish-test/index.html"), new RegExp(TITLE));
    // feeds
    assert.match(read("sitemap.xml"), /\/weblog\/2099\/01\/01\/hello-from-the-publish-test\.html/);
    const feed = read("feed.xml");
    assert.match(feed, new RegExp(TITLE));
    // derived from the copied Markdown (existing posts + the fixture), so publishing a real article never breaks this test
    const expectedEntries = readdirSync(join(tmp, "_posts")).filter((f) =>
      f.endsWith(".md"),
    ).length;
    assert.ok(expectedEntries >= 4);
    assert.equal((feed.match(/<entry>/g) ?? []).length, expectedEntries);
    // curated book + cover
    assert.match(read("index.html"), /A Test Book/);
    assert.ok(existsSync(join(dist, "curated", COVER)), "cover copied to the artifact");
    assert.match(read("index.html"), new RegExp(`/weblog/curated/${COVER}`));
    assert.ok(existsSync(join(dist, "curated", COVER_WEBP)), "WebP cover copied to the artifact");
    assert.match(read("index.html"), new RegExp(`/weblog/curated/${COVER_WEBP}`));
    assert.match(read("index.html"), /A Second Test Book/);
    assert.ok(existsSync(join(dist, "curated", COVER_JPEG)), ".jpeg cover copied to the artifact");
    assert.match(read("index.html"), new RegExp(`/weblog/curated/${COVER_JPEG}`));
    assert.ok(existsSync(join(dist, "curated", COVER_UPPER)), "upper-case-extension cover copied");
    assert.match(read("index.html"), new RegExp(`/weblog/curated/${COVER_UPPER}`));
    assert.match(read("index.html"), new RegExp(THOUGHTS), "owner-written thoughts are shown");
    // existing content untouched
    for (const f of [
      "2021/07/30/extension-pack-for-vscode-and-code-server.html",
      "2022/02/01/introduction-to-api-gateway.html",
      "2022/07/16/setting-up-an-api-ateway-for-your-microservices.html",
    ])
      assert.ok(existsSync(join(dist, f)), f);

    // 4. search finds the new article in a real browser, served like GitHub Pages
    const port = 4600 + Math.floor(Math.random() * 300);
    const server = spawn(process.execPath, [join(root, "scripts/serve-dist.mjs")], {
      env: { ...process.env, DIST: dist, PORT: String(port) },
      stdio: ["ignore", "pipe", "inherit"],
    });
    await new Promise((res) =>
      server.stdout.on("data", (d) => String(d).includes("serving") && res()),
    );
    const browser = await chromium.launch();
    t.after(async () => {
      await browser.close();
      server.kill();
    });
    const page = await (await browser.newContext()).newPage();
    await page.route(/fonts\./, (r) => r.abort());
    await page.goto(`http://127.0.0.1:${port}/weblog/`, { waitUntil: "networkidle" });
    await page.keyboard.press("/");
    await page.keyboard.type("publish test", { delay: 15 });
    await page
      .getByRole("dialog")
      .getByText(/^\d+ results?$/)
      .waitFor();
    assert.match(await page.getByRole("dialog").innerText(), new RegExp(TITLE));

    // 5. the release gates themselves must accept the authored content (a new book/article must not need a test edit):
    //    the curated unit tests, the post-deploy live check (against the served copy) and the browser suite on the copy's build
    // NODE_TEST_CONTEXT is set because this file itself runs under `node --test`; inherited by a nested `node --test`
    // it switches that child into a mode that exits 0 even when its tests fail, so it MUST be removed. `expect` is a
    // pattern the output has to contain, proving the gate really ran (and not just exited 0).
    const gate = (name, args, expect) => {
      const env = { ...process.env, FORCE_COLOR: "0" };
      delete env.NODE_TEST_CONTEXT;
      delete env.NO_COLOR;
      const r = spawnSync(process.execPath, args, { cwd: tmp, encoding: "utf8", env });
      // CI forces colour; strip ANSI escapes so the patterns below match in every environment
      const out = `${r.stdout}\n${r.stderr}`.replace(/\x1b\[[0-9;]*m/g, "");
      assert.equal(r.status, 0, `${name} failed on the modified copy:\n${out}`);
      assert.match(out, expect, `${name} did not report what it should have:\n${out}`);
    };
    gate(
      "curated unit tests",
      ["node_modules/vitest/vitest.mjs", "run", "src/content"],
      /Tests\s+\d+ passed/,
    );
    gate("live-check", ["scripts/live-check.mjs", `http://127.0.0.1:${port}`], /live-check OK/);
    gate(
      "browser suite (static-site)",
      ["--test", "tests/e2e/static-site.test.mjs"],
      /# pass [1-9]\d*[\s\S]*# fail 0/,
    );
    // the visual gate: the added article and book change the home page, so only the content-dependent shots may be
    // skipped (named in the output); every other approved shot must still match
    const visual = spawnSync(
      process.execPath,
      ["scripts/visual-check.mjs", join(tmp, "visual-out")],
      {
        cwd: tmp,
        encoding: "utf8",
        env: { ...process.env, VISUAL_MODE: "structural" },
      },
    );
    assert.equal(
      visual.status,
      0,
      `visual gate failed on the modified copy:\n${visual.stdout}\n${visual.stderr}`,
    );
    assert.match(visual.stdout, /content-dependent shots are skipped/);
    assert.match(visual.stdout, /36\/36 body regions match the approved reference/);
  },
);
