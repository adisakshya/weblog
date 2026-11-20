// Branded 404 (#87) against the BUILT static site under /weblog/: the आदि mark, "Back to the beginning.", one button, inside the normal
// site shell; the static 404 contract (status 404 for unknown URLs, the exact text "Page not found") is unchanged.
import { after, before, describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { INTRO, openPage, start } from "./helpers.mjs";

let env;
before(async () => {
  env = await start();
});
after(async () => {
  await env.stop();
});

const TITLE = "Page not found — Adisakshya Chauhan";
const COPY = "This page doesn't exist — but every path on this blog starts from the same point.";
const UNKNOWN = [
  "/weblog/does-not-exist/",
  "/weblog/tags/no-such-tag/",
  "/weblog/series/no-such-series/",
  "/weblog/2099/01/01/not-an-article.html",
];
const phone = (w) => w < 768;
const THEMES = [
  "original",
  "paper",
  "sepia",
  "solarized-light",
  "dark-modern",
  "solarized-dark",
  "space",
  "spiderman",
  "batman",
  "superman",
  "ironman",
];

describe("dist/404.html (what GitHub Pages serves for an unknown URL)", () => {
  const html = readFileSync("dist/client/404.html", "utf8");
  it('contains the exact text "Page not found" (scripts/postbuild.mjs requires it), the heading, the copy and a link to /weblog/', () => {
    assert.ok(html.includes("Page not found"), "case-sensitive");
    assert.match(html, /<p class="j-notfound-label">404 · Page not found<\/p>/);
    assert.match(html, /<h1 class="j-notfound-title">Back to the beginning\.<\/h1>/);
    assert.ok(
      html.includes(COPY.replace("doesn't", "doesn&#x27;t")) || html.includes(COPY),
      "the body copy",
    );
    assert.match(
      html,
      /<a[^>]*href="\/weblog\/"[^>]*class="j-btn j-notfound-button"[^>]*>Go to the blog<\/a>|<a[^>]*class="j-btn j-notfound-button"[^>]*href="\/weblog\/"[^>]*>Go to the blog<\/a>/,
    );
  });
  it("is in the normal site shell, has the title and noindex, and inlines the approved mark byte for byte", () => {
    assert.match(html, /<title>Page not found — Adisakshya Chauhan<\/title>/);
    assert.match(html, /<meta name="robots" content="noindex"\/>/);
    assert.match(html, /class="journal j-shell"/);
    assert.match(html, /<header[^>]*class="j-header"/);
    assert.match(html, /<footer class="j-footer"/);
    assert.ok(html.includes(readFileSync("docs/brand/assets/adi-mark.svg", "utf8").trim()));
    assert.doesNotMatch(html, /<img[^>]+adi-mark/);
  });
  it("no other page is marked noindex", () => {
    for (const f of [
      "index.html",
      "about/index.html",
      "2022/02/01/introduction-to-api-gateway.html",
      "tags/kong/index.html",
    ])
      assert.doesNotMatch(readFileSync(`dist/client/${f}`, "utf8"), /name="robots"/, f);
  });
});

describe("unknown URLs on the static server", () => {
  for (const route of UNKNOWN)
    it(`${route}: status 404, the branded page in the site shell, title and noindex`, async () => {
      const { ctx, page } = await openPage(env, null);
      const res = await page.goto(env.base + route, { waitUntil: "networkidle" });
      assert.equal(res.status(), 404);
      assert.equal(await page.title(), TITLE);
      assert.equal(await page.locator("h1").count(), 1);
      assert.equal(await page.locator("h1").innerText(), "Back to the beginning.");
      assert.equal(await page.locator(".j-notfound-label").innerText(), "404 · Page not found");
      assert.equal(await page.locator(".j-notfound-text").innerText(), COPY);
      assert.equal(await page.locator('meta[name="robots"]').getAttribute("content"), "noindex");
      assert.equal(await page.locator(".j-header").count(), 1, "header");
      assert.equal(await page.locator(".j-footer").count(), 1, "footer");
      assert.equal(
        await page.getByRole("img", { name: "Adi", exact: true }).count(),
        1,
        "the mark is named Adi",
      );
      assert.match(await page.locator("body").innerText(), /Page not found/);
      // styled, not a bare document
      const st = await page.evaluate(() => ({
        h1: parseFloat(getComputedStyle(document.querySelector("h1")).fontSize),
        btn: getComputedStyle(document.querySelector(".j-notfound-button")).backgroundColor,
        label: getComputedStyle(document.querySelector(".j-notfound-label")).fontFamily,
      }));
      assert.ok(st.h1 >= 32, `heading ${st.h1}px`);
      assert.notEqual(st.btn, "rgba(0, 0, 0, 0)");
      assert.match(st.label, /JetBrains Mono|monospace/);
      await ctx.close();
    });

  it('"Go to the blog" goes to /weblog/ (client-side) and the home page loads', async () => {
    const { ctx, page, problems } = await openPage(env, null);
    await page.goto(env.base + "/weblog/does-not-exist/", { waitUntil: "networkidle" });
    await page.evaluate(() => (window.__spa = 1));
    const btn = page.getByRole("link", { name: "Go to the blog", exact: true });
    assert.equal(await btn.getAttribute("href"), "/weblog/");
    await btn.click();
    await page.waitForURL(/\/weblog\/$/);
    assert.equal(await page.evaluate(() => window.__spa), 1, "client-side navigation");
    await page.getByRole("link", { name: /Read the article/ }).waitFor();
    await page.waitForFunction(() => document.title === "Adisakshya Chauhan");
    await page.waitForFunction(() => !document.querySelector('meta[name="robots"]'));
    // the only console message is the browser reporting the 404 of the document it started on
    assert.deepEqual(
      problems().filter((p) => !/status of 404/.test(p)),
      [],
    );
    await ctx.close();
  });

  it("the keyboard reaches the button with a visible focus ring", async () => {
    const { ctx, page } = await openPage(env, "/weblog/does-not-exist/");
    const btn = page.getByRole("link", { name: "Go to the blog", exact: true });
    await btn.focus();
    const ring = await btn.evaluate((e) => {
      const cs = getComputedStyle(e);
      return { style: cs.outlineStyle, w: parseFloat(cs.outlineWidth) };
    });
    assert.notEqual(ring.style, "none");
    assert.ok(ring.w >= 2);
    await ctx.close();
  });
});

describe("one component for every not-found state", () => {
  it("an unknown article URL reached by client navigation renders exactly the same page as an unknown URL", async () => {
    const direct = await openPage(env, null);
    await direct.page.goto(env.base + "/weblog/does-not-exist/", { waitUntil: "networkidle" });
    const a = await direct.page.locator("main").innerHTML();
    await direct.ctx.close();
    const { ctx, page } = await openPage(env, INTRO);
    await page.evaluate(() => {
      history.pushState({}, "", "/weblog/2099/01/01/not-an-article.html");
      window.dispatchEvent(new PopStateEvent("popstate"));
    });
    await page.getByRole("heading", { name: "Back to the beginning." }).waitFor();
    assert.equal(await page.locator("main").innerHTML(), a, "same markup");
    assert.equal(await page.title(), TITLE);
    assert.equal(await page.locator('meta[name="robots"]').getAttribute("content"), "noindex");
    await ctx.close();
  });

  it("a direct load of an unknown article-shaped URL hydrates without errors and keeps the not-found title", async () => {
    const { ctx, page, problems } = await openPage(env, null);
    const msgs = [];
    page.on("console", (m) => /hydrat/i.test(m.text()) && msgs.push(m.text()));
    await page.goto(env.base + "/weblog/2099/01/01/not-an-article.html", {
      waitUntil: "networkidle",
    });
    await page.getByRole("heading", { name: "Back to the beginning." }).waitFor();
    assert.deepEqual(msgs, []);
    assert.equal(await page.title(), TITLE);
    assert.deepEqual(
      problems().filter((p) => !/status of 404/.test(p)),
      [],
    );
    await ctx.close();
  });
});

describe("layout and theme", () => {
  for (const w of [390, 1440])
    it(`${w}px: centred, the mark is ${w >= 640 ? 150 : "scaled down from 150"}px tall, nothing overflows`, async () => {
      const { ctx, page } = await openPage(env, "/weblog/does-not-exist/", {
        width: w,
        height: 844,
        touch: phone(w),
      });
      const m = await page.evaluate(() => {
        const c = (e) => {
          const b = e.getBoundingClientRect();
          return { cx: (b.left + b.right) / 2, w: b.width, h: b.height, l: b.left, r: b.right };
        };
        return {
          vw: innerWidth,
          mark: c(document.querySelector(".adi-mark svg")),
          h1: c(document.querySelector("h1")),
          btn: c(document.querySelector(".j-notfound-button")),
          label: c(document.querySelector(".j-notfound-label")),
          align: getComputedStyle(document.querySelector(".j-notfound")).textAlign,
          overflow: document.documentElement.scrollWidth > innerWidth,
        };
      });
      const mid = w / 2;
      for (const k of ["mark", "h1", "btn", "label"])
        assert.ok(Math.abs(m[k].cx - mid) <= 2, `${k} is centred (${m[k].cx} vs ${mid})`);
      assert.equal(m.align, "center");
      if (w >= 640) assert.equal(Math.round(m.mark.h), 150);
      else assert.ok(m.mark.h < 150 && m.mark.h >= 64, `phone mark ${m.mark.h}px`);
      assert.ok(m.mark.l >= 0 && m.mark.r <= w);
      assert.equal(m.overflow, false);
      await ctx.close();
    });

  for (const w of [390, 1440])
    it(`${w}px: in every theme the mark's glyph is --j-fg and its point #E2452F, and the text is readable (4.5:1)`, async () => {
      const { ctx, page } = await openPage(env, "/weblog/does-not-exist/", {
        width: w,
        touch: phone(w),
      });
      for (const id of THEMES) {
        const m = await page.evaluate((id) => {
          document.documentElement.setAttribute("data-theme", id);
          const px = (css) => {
            const c = document.createElement("canvas");
            c.width = c.height = 1;
            const x = c.getContext("2d");
            x.fillStyle = css;
            x.fillRect(0, 0, 1, 1);
            return [...x.getImageData(0, 0, 1, 1).data.slice(0, 3)];
          };
          const lum = ([r, g, b]) => {
            const f = (v) => ((v /= 255) <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
            return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
          };
          const ratio = (a, b) => {
            const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
            return +((x + 0.05) / (y + 0.05)).toFixed(2);
          };
          const root = getComputedStyle(document.querySelector(".journal"));
          const bg = px(root.getPropertyValue("--j-bg"));
          const fg = px(root.getPropertyValue("--j-fg"));
          const mark = document.querySelector(".adi-mark svg");
          const glyph = px(getComputedStyle(mark.querySelector("g > g")).fill);
          const point = px(getComputedStyle(mark.querySelector("circle")).fill);
          const color = (sel) => px(getComputedStyle(document.querySelector(sel)).color);
          const btn = document.querySelector(".j-notfound-button");
          return {
            glyph,
            point,
            fg,
            h1: ratio(color("h1"), bg),
            label: ratio(color(".j-notfound-label"), bg),
            text: ratio(color(".j-notfound-text"), bg),
            button: ratio(
              px(getComputedStyle(btn).color),
              px(getComputedStyle(btn).backgroundColor),
            ),
            glyphVsBg: ratio(glyph, bg),
          };
        }, id);
        assert.deepEqual(m.glyph, m.fg, `${id}: glyph = --j-fg`);
        assert.deepEqual(m.point, [226, 69, 47], `${id}: point`);
        for (const k of ["h1", "label", "text", "button", "glyphVsBg"])
          assert.ok(m[k] >= 4.5, `${w}px ${id}: ${k} ${m[k]}:1`);
      }
      await ctx.close();
    });
});
