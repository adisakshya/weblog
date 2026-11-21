// Site title (#84): "Adisakshya Chauhan" is the site/brand name in the built HTML and the feed; posts and sub-pages read
// "{page title} — Adisakshya Chauhan" (em dash). Feed <id>, entry ids and URLs must not change (readers would show duplicates).
import { after, before, describe, it } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { ARTICLES, INTRO, openPage, start } from "./helpers.mjs";

const NAME = "Adisakshya Chauhan";
const DIST = "dist/client";
const decode = (s) =>
  s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;|&#39;/g, "'");
const file = (route) => {
  const rel = route.replace(/^\/weblog\//, "");
  for (const c of [
    rel.endsWith(".html") ? rel : `${rel}index.html`,
    `${rel.replace(/\/$/, "")}.html`,
  ])
    if (rel === "" ? existsSync(`${DIST}/index.html`) : existsSync(join(DIST, c)))
      return join(DIST, rel === "" ? "index.html" : c);
  throw new Error(`no built file for ${route}`);
};
const html = (route) => readFileSync(file(route), "utf8");
const title = (h) => decode(h.match(/<title>([\s\S]*?)<\/title>/)[1]);
const meta = (h, attr, key) => {
  const m =
    h.match(new RegExp(`<meta[^>]*${attr}="${key}"[^>]*content="([^"]*)"`)) ??
    h.match(new RegExp(`<meta[^>]*content="([^"]*)"[^>]*${attr}="${key}"`));
  return m ? decode(m[1]) : null;
};
const walk = (dir) =>
  readdirSync(dir).flatMap((f) =>
    statSync(join(dir, f)).isDirectory() ? walk(join(dir, f)) : [join(dir, f)],
  );

describe("home page", () => {
  const h = html("/weblog/");
  it('<title>, og:site_name, og:title are "Adisakshya Chauhan"', () => {
    assert.equal(title(h), NAME);
    assert.equal(meta(h, "property", "og:site_name"), NAME);
    assert.equal(meta(h, "property", "og:title"), NAME);
  });
  it("the screen-reader h1 and the feed link carry the new name, and the description is unchanged", () => {
    assert.match(h, /<h1 class="sr-only">Adisakshya Chauhan<\/h1>/);
    assert.match(
      h,
      /<link[^>]*rel="alternate"[^>]*type="application\/atom\+xml"[^>]*title="Adisakshya Chauhan"/,
    );
    // the home route sets its own description; it is unchanged by the rename
    assert.equal(
      meta(h, "name", "description"),
      "A compilation of Adisakshya’s musings, inspirations, mistakes, and other ramblings — on API gateways, microservices and developer tools.",
    );
  });
});

describe("page titles: {page title} — Adisakshya Chauhan", () => {
  for (const route of ARTICLES)
    it(`post ${route.split("/").pop()}`, () => {
      const h = html(route);
      const ogTitle = meta(h, "property", "og:title");
      assert.ok(ogTitle && ogTitle.length > 3);
      assert.equal(title(h), `${ogTitle} — ${NAME}`);
      assert.equal(meta(h, "property", "og:site_name"), NAME);
    });
  for (const [route, expected] of [
    ["/weblog/about/", `About — ${NAME}`],
    ["/weblog/contact/", `Contact — ${NAME}`],
    ["/weblog/terms/", `Terms and policies — ${NAME}`],
  ])
    it(`${route}`, () => assert.equal(title(html(route)), expected));
  for (const route of ["/weblog/series/api-gateway-101/", "/weblog/series/blogging-101/"])
    it(`series ${route}`, () => {
      const t = title(html(route));
      assert.ok(t.endsWith(` — ${NAME}`), t);
      assert.ok(t.length > ` — ${NAME}`.length + 2, "has the series name before the suffix");
    });
  for (const tag of [
    "api-gateway",
    "kong",
    "microservices",
    "docker",
    "vscode",
    "code-server",
    "github",
    "ci-cd",
    "travis",
  ])
    it(`tag ${tag}`, () => {
      const t = title(html(`/weblog/tags/${tag}/`));
      assert.ok(t.endsWith(` — ${NAME}`), t);
    });

  it("the old name and the old hyphen suffix appear in no built page", () => {
    const bad = [];
    for (const f of walk(DIST).filter((f) => f.endsWith(".html"))) {
      const h = readFileSync(f, "utf8");
      if (/The blog of Adisakshya/.test(h) || /<title>[^<]* - The blog/.test(h)) bad.push(f);
    }
    assert.deepEqual(bad, []);
  });
});

describe("feed.xml: only the title changes; ids and URLs stay", () => {
  const feed = readFileSync(`${DIST}/feed.xml`, "utf8");
  const sitemap = readFileSync(`${DIST}/sitemap.xml`, "utf8");
  it('<title> is "Adisakshya Chauhan"', () => {
    assert.match(feed, /<feed [^>]*>\s*<title>Adisakshya Chauhan<\/title>/);
    assert.doesNotMatch(feed, /The blog of/);
  });
  it("the feed id is the site root and every entry id equals its own post URL, which is a sitemap URL", () => {
    assert.match(feed, /<id>https:\/\/adisakshya\.github\.io\/weblog\/<\/id>\s*<updated>/);
    const entries = feed.split("<entry>").slice(1);
    assert.ok(entries.length >= 3);
    const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
    for (const e of entries) {
      const id = e.match(/<id>([^<]+)<\/id>/)[1];
      const link = e.match(/<link rel="alternate" type="text\/html" href="([^"]+)"/)[1];
      assert.equal(id, link, "entry id = entry URL");
      assert.match(
        id,
        /^https:\/\/adisakshya\.github\.io\/weblog\/\d{4}\/\d{2}\/\d{2}\/[a-z0-9-]+\.html$/,
      );
      assert.ok(locs.includes(id), `${id} is in the sitemap`);
    }
    assert.match(
      feed,
      /<link rel="self" type="application\/atom\+xml" href="https:\/\/adisakshya\.github\.io\/weblog\/feed\.xml"\/>/,
    );
  });
});

describe("in the browser", () => {
  let env;
  before(async () => {
    env = await start();
  });
  after(async () => {
    await env.stop();
  });
  it("document.title follows client navigation: home, then a post, with the new pattern", async () => {
    const { ctx, page } = await openPage(env, "/weblog/");
    assert.equal(await page.title(), NAME);
    await page.getByRole("link", { name: /Read the article/ }).click();
    await page.waitForURL(/\.html$/);
    await page.waitForFunction((n) => document.title.endsWith(` — ${n}`), NAME);
    assert.match(await page.title(), new RegExp(` — ${NAME}$`));
    await page.goto(env.base + INTRO, { waitUntil: "networkidle" });
    assert.equal(await page.title(), `Introduction to API Gateway — ${NAME}`);
    await ctx.close();
  });
});
