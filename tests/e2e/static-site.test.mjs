// Behavioural checks against the real static build (dist/client) served like GitHub Pages under /weblog/.
//   bun run build && node --test tests/e2e/
import { after, before, describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { ROUTES, start, watch } from "./helpers.mjs";

let env;
before(async () => {
  env = await start();
});
after(async () => {
  await env.stop();
});

// third-party fonts are unreachable/slow in some sandboxes; they are not part of what is being verified here
const blockFonts = (ctx) =>
  ctx.route(/fonts\.(googleapis|gstatic|cdnfonts)\.com/, (r) => r.abort());

describe("direct loads and refresh under /weblog/", () => {
  for (const route of ROUTES) {
    it(`${route} loads, renders, hydrates cleanly and survives a refresh`, async () => {
      const ctx = await env.browser.newContext();
      await blockFonts(ctx);
      const page = await ctx.newPage();
      const problems = watch(page, env.base);
      const res = await page.goto(env.base + route, { waitUntil: "networkidle" });
      assert.equal(res.status(), 200);
      assert.ok(await page.locator("h1, h2").first().isVisible(), "has a visible heading");
      const title = await page.title();
      await page.reload({ waitUntil: "networkidle" });
      assert.equal(await page.title(), title);
      assert.ok(
        await page
          .locator("main")
          .innerText()
          .then((t) => t.length > 40),
        "main content present after refresh",
      );
      assert.deepEqual(
        problems.filter((p) => !/ERR_FAILED|fonts\./.test(p)),
        [],
      );
      await ctx.close();
    });
  }
});

describe("prerendered HTML is the right document", () => {
  it("home index.html is the Posts view (a query-string prerender must never overwrite it)", () => {
    const html = readFileSync("dist/client/index.html", "utf8");
    assert.match(html, /aria-label="Posts" aria-pressed="true"/);
    for (const marker of ["Read the article", "Explore by subject", "Bookshelf", "Worth watching"])
      assert.ok(html.includes(marker), marker);
  });
  it("every route's static HTML carries its own content, not the 404 or another route", () => {
    const expect = {
      "contact/index.html": "Have a question for me?",
      "terms/index.html": "Privacy policy",
      "series/api-gateway-101/index.html": "read in order",
      "2022/02/01/introduction-to-api-gateway.html": "Introduction to API Gateway",
    };
    for (const [file, text] of Object.entries(expect)) {
      const html = readFileSync(`dist/client/${file}`, "utf8");
      assert.ok(html.includes(text), `${file} should contain ${text}`);
      assert.ok(!html.includes("Page not found"), `${file} must not be the 404 page`);
    }
  });
});

describe("taxonomy and pages", () => {
  it("shows an explicit empty state on the empty series page instead of a bare heading", async () => {
    const ctx = await env.browser.newContext();
    await blockFonts(ctx);
    const page = await ctx.newPage();
    await page.goto(env.base + "/weblog/series/blogging-101/", { waitUntil: "networkidle" });
    assert.match(await page.locator("main").innerText(), /No articles in this series yet/);
    await ctx.close();
  });
  it("lists every tag of an article on its page, and each tag page lists its articles", async () => {
    const ctx = await env.browser.newContext();
    await blockFonts(ctx);
    const page = await ctx.newPage();
    await page.goto(
      env.base + "/weblog/2021/07/30/extension-pack-for-vscode-and-code-server.html",
      {
        waitUntil: "networkidle",
      },
    );
    for (const tag of ["vscode", "code-server", "github", "ci-cd", "travis"]) {
      assert.ok(await page.locator(`main a[href="/weblog/tags/${tag}"]`).first().isVisible(), tag);
    }
    await page.goto(env.base + "/weblog/tags/travis/", { waitUntil: "networkidle" });
    assert.match(await page.locator("main").innerText(), /Extension Pack for VSCode/);
    await ctx.close();
  });
  it("renders no comments section or form on any article", async () => {
    const ctx = await env.browser.newContext();
    await blockFonts(ctx);
    const page = await ctx.newPage();
    for (const r of ROUTES.filter((x) => x.endsWith(".html"))) {
      await page.goto(env.base + r, { waitUntil: "networkidle" });
      const text = await page.locator("body").innerText();
      assert.doesNotMatch(text, /Leave a Comment|Comments|Mockup note|Staticman/i, r);
      assert.equal(await page.locator("form").count(), 0, r);
    }
    await ctx.close();
  });
});

describe("feeds", () => {
  it("serves sitemap.xml and feed.xml as XML (both were 404 in the Jekyll production site)", async () => {
    for (const file of ["sitemap.xml", "feed.xml"]) {
      const r = await fetch(`${env.base}/weblog/${file}`);
      assert.equal(r.status, 200, file);
      assert.match(r.headers.get("content-type") ?? "", /xml/, file);
    }
  });
});

describe("curated covers", () => {
  it("home references every cover under /weblog/curated/ and each is served as a JPEG", async () => {
    const html = readFileSync("dist/client/index.html", "utf8");
    const urls = [
      ...new Set([...html.matchAll(/\/weblog\/curated\/[a-z-]+\.jpg/g)].map((m) => m[0])),
    ];
    assert.equal(urls.length, 10);
    for (const u of urls) {
      const r = await fetch(env.base + u);
      assert.equal(r.status, 200, u);
      assert.equal(r.headers.get("content-type"), "image/jpeg", u);
      assert.deepEqual(
        [...new Uint8Array(await r.arrayBuffer()).slice(0, 3)],
        [0xff, 0xd8, 0xff],
        u,
      );
    }
  });
});

describe("GitHub Pages semantics", () => {
  it("serves a real 404 page with status 404 for unknown routes", async () => {
    const ctx = await env.browser.newContext();
    await blockFonts(ctx);
    const page = await ctx.newPage();
    const res = await page.goto(env.base + "/weblog/does-not-exist/", { waitUntil: "networkidle" });
    assert.equal(res.status(), 404);
    assert.match(await page.locator("body").innerText(), /Page not found/);
    await ctx.close();
  });
  it("redirects a directory route without trailing slash to the slash form", async () => {
    const res = await fetch(env.base + "/weblog/contact", { redirect: "manual" });
    assert.equal(res.status, 301);
    assert.equal(new URL(res.headers.get("location"), env.base).pathname, "/weblog/contact/");
  });
  it("keeps legacy image assets at their historical URLs", async () => {
    for (const p of [
      "/weblog/assets/images/avatar.jpg",
      "/weblog/assets/images/sun.webp",
      "/weblog/assets/images/jekyll.png",
      "/weblog/assets/favicon.ico",
      "/weblog/favicon.ico",
    ]) {
      const r = await fetch(env.base + p);
      assert.equal(r.status, 200, p);
    }
  });
  it("serves every asset the pages reference from under /weblog/ (nothing at the site root)", async () => {
    const ctx = await env.browser.newContext();
    await blockFonts(ctx);
    const page = await ctx.newPage();
    const rootRequests = [];
    page.on("request", (r) => {
      const u = new URL(r.url());
      if (u.origin === env.base && !u.pathname.startsWith("/weblog/"))
        rootRequests.push(u.pathname);
    });
    for (const route of ROUTES) await page.goto(env.base + route, { waitUntil: "networkidle" });
    assert.deepEqual(rootRequests, []);
    await ctx.close();
  });
});

describe("client navigation", () => {
  it("opens an article from the home page, then a refresh on that URL still works", async () => {
    const ctx = await env.browser.newContext();
    await blockFonts(ctx);
    const page = await ctx.newPage();
    const problems = watch(page, env.base);
    await page.goto(env.base + "/weblog/", { waitUntil: "networkidle" });
    await page.getByRole("link", { name: /Read the article/ }).click();
    await page.waitForURL(
      /\/weblog\/2022\/07\/16\/setting-up-an-api-ateway-for-your-microservices\.html$/,
    );
    await page
      .locator("h1")
      .filter({ hasText: /API Gateway/ })
      .waitFor();
    await page.reload({ waitUntil: "networkidle" });
    await page
      .locator("h1")
      .filter({ hasText: /API Gateway/ })
      .waitFor();
    assert.deepEqual(
      problems.filter((p) => !/ERR_FAILED|fonts\./.test(p)),
      [],
    );
    await ctx.close();
  });
});
