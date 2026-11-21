// The आदि footer seal and the article end-mark (#86) against the BUILT static site under /weblog/.
import { after, before, describe, it } from "node:test";
import assert from "node:assert/strict";
import { ARTICLES, EXT, INTRO, ROUTES, SETUP, openPage, start } from "./helpers.mjs";

let env;
before(async () => {
  env = await start();
});
after(async () => {
  await env.stop();
});

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

const footerSeal = (page) =>
  page.evaluate(() => {
    const box = (e) => {
      const b = e.getBoundingClientRect();
      return { l: b.left, r: b.right, t: b.top, b: b.bottom, w: b.width, h: b.height };
    };
    const seals = [...document.querySelectorAll(".j-footer .adi-seal")];
    const seal = seals[0];
    const p = seal?.closest("p");
    const text = p?.querySelector(":scope > span:not(.adi-seal)");
    const range = document.createRange();
    if (text) range.selectNodeContents(text);
    return {
      count: seals.length,
      aria: seal?.getAttribute("aria-hidden"),
      transform: seal ? getComputedStyle(seal).transform : null,
      sealBox: seal ? box(seal) : null,
      svgBox: seal ? box(seal.querySelector("svg")) : null,
      pBox: p ? box(p) : null,
      textBox: text ? box(text) : null,
      textRect: text ? box({ getBoundingClientRect: () => range.getBoundingClientRect() }) : null,
      metaText: [...document.querySelectorAll(".j-footer-meta p")].map((e) => {
        const c = e.cloneNode(true);
        c.querySelectorAll(".adi-seal").forEach((x) => x.remove());
        return c.textContent.trim().replace(/\s+/g, " ");
      }),
      footerText: document.querySelector(".j-footer").innerText,
      docOverflow: document.documentElement.scrollWidth > innerWidth,
      vw: innerWidth,
    };
  });

describe("footer seal (#86)", () => {
  for (const route of ROUTES.filter((r) => r !== "/weblog/404.html"))
    it(`${route}: one aria-hidden 44px seal, untilted, left of the © line and vertically centred`, async () => {
      const { ctx, page } = await openPage(env, route, { width: 1440 });
      const f = await footerSeal(page);
      assert.equal(f.count, 1, "exactly one footer seal");
      assert.equal(f.aria, "true");
      assert.ok(
        Math.abs(f.sealBox.w - 44) < 0.5 && Math.abs(f.sealBox.h - 44) < 0.5,
        `${f.sealBox.w}x${f.sealBox.h}`,
      );
      assert.ok(
        f.transform === "none" || f.transform === "matrix(1, 0, 0, 1, 0, 0)",
        `no tilt: ${f.transform}`,
      );
      // the drawing itself fills the 44px box (a stray icon rule once shrank the SVG to 15px inside it)
      assert.ok(
        Math.abs(f.svgBox.w - 44) < 0.5 && Math.abs(f.svgBox.h - 44) < 0.5,
        `the seal's SVG is ${f.svgBox.w}x${f.svgBox.h}`,
      );
      assert.ok(f.sealBox.r <= f.textBox.l + 0.5, "the seal is left of the © line");
      const mid = (b) => (b.t + b.b) / 2;
      assert.ok(
        Math.abs(mid(f.sealBox) - mid(f.textRect)) <= 1.5,
        "vertically centred on the line",
      );
      assert.ok(f.pBox.h <= 44.5, `the © row stays ${f.pBox.h}px: the seal adds no height`);
      await ctx.close();
    });

  it("no text explains the name: the footer says exactly what it said before, plus nothing", async () => {
    const { ctx, page } = await openPage(env, "/weblog/contact/", { width: 1440 });
    const f = await footerSeal(page);
    assert.match(f.metaText[0], /^© \d{4} Adisakshya Chauhan$/);
    assert.equal(f.metaText[1], "Made with love. Open source.");
    assert.ok(!/आदि|meaning|means|beginning/i.test(f.footerText), "no explanation of the name");
    await ctx.close();
  });

  for (const w of [320, 390, 1440])
    it(`${w}px: no overflow, the seal never overlaps the text`, async () => {
      const { ctx, page } = await openPage(env, "/weblog/contact/", { width: w, touch: phone(w) });
      const f = await footerSeal(page);
      assert.equal(f.docOverflow, false);
      assert.ok(f.sealBox.l >= 0 && f.sealBox.r <= w);
      assert.ok(f.sealBox.r <= f.textBox.l + 0.5);
      await ctx.close();
    });

  it("follows every theme at 390 and 1440px: tile = --j-fg (documented override in Dune and Deep Sea), point #E2452F at least 3:1, visible against the footer", async () => {
    const OVERRIDE = { "solarized-light": [31, 42, 48], "solarized-dark": [237, 243, 244] };
    for (const w of [390, 1440]) {
      const { ctx, page } = await openPage(env, "/weblog/contact/", { width: w, touch: phone(w) });
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
          const seal = document.querySelector(".j-footer .adi-seal");
          const fill = (sel) => px(getComputedStyle(seal.querySelector(sel)).fill);
          const root = getComputedStyle(document.querySelector(".journal"));
          const tile = fill("rect"),
            glyph = fill("g > g"),
            point = fill("circle");
          const panel = px(getComputedStyle(document.querySelector(".j-footer")).backgroundColor);
          return {
            tile,
            glyph,
            point,
            fg: px(root.getPropertyValue("--j-fg")),
            bg: px(root.getPropertyValue("--j-bg")),
            pointVsTile: ratio(point, tile),
            glyphVsTile: ratio(glyph, tile),
            tileVsFooter: ratio(tile, panel),
          };
        }, id);
        assert.deepEqual(m.point, [226, 69, 47], `${w}px ${id}: point`);
        assert.deepEqual(m.glyph, m.bg, `${w}px ${id}: glyph = --j-bg`);
        assert.deepEqual(m.tile, OVERRIDE[id] ?? m.fg, `${w}px ${id}: tile`);
        assert.ok(m.pointVsTile >= 3, `${w}px ${id}: point vs tile ${m.pointVsTile}:1`);
        assert.ok(m.glyphVsTile >= 4.5, `${w}px ${id}: glyph vs tile ${m.glyphVsTile}:1`);
        assert.ok(
          m.tileVsFooter >= 3,
          `${w}px ${id}: the seal is visible against the footer ${m.tileVsFooter}:1`,
        );
      }
      await ctx.close();
    }
  });
});

const markInfo = (page) =>
  page.evaluate(() => {
    const prose = document.querySelector(".prose-j");
    const marks = [...document.querySelectorAll(".end-mark")];
    const m = marks[0];
    const cs = m && getComputedStyle(m);
    // a baseline probe: an empty inline-block's bottom edge is the baseline of its line
    let baselineGap = null;
    if (m) {
      const probe = document.createElement("span");
      probe.style.cssText = "display:inline-block;width:0;height:0";
      m.after(probe);
      baselineGap = m.getBoundingClientRect().bottom - probe.getBoundingClientRect().bottom;
      probe.remove();
    }
    const parent = m?.parentElement;
    const before = m?.previousSibling;
    const ownLine = parent?.classList.contains("end-mark-line");
    return {
      count: marks.length,
      allLabelled: document.querySelectorAll('[aria-label="End of article"]').length,
      role: m?.getAttribute("role"),
      label: m?.getAttribute("aria-label"),
      bg: cs?.backgroundColor,
      radius: cs?.borderTopLeftRadius,
      w: m?.getBoundingClientRect().width,
      h: m?.getBoundingClientRect().height,
      fontSize: parseFloat(getComputedStyle(parent ?? document.body).fontSize),
      marginLeft: parseFloat(cs?.marginLeft ?? "0"),
      baselineGap,
      ownLine,
      parentTag: parent?.tagName,
      lastBlockIsParent: ownLine
        ? prose.lastElementChild === parent
        : prose.lastElementChild === parent,
      insideCode: !!m?.closest(".code-block, pre, code"),
      precededBy: before?.textContent?.slice(-12) ?? null,
      markLeft: m?.getBoundingClientRect().left,
      proseLeft: prose.getBoundingClientRect().left,
      textHasLabel: prose.textContent.includes("End of article"),
    };
  });

describe("article end-mark (#86)", () => {
  for (const route of ARTICLES)
    it(`${route}: exactly one vermilion point, announced once as "End of article", never in a code block`, async () => {
      const { ctx, page, problems } = await openPage(env, route);
      const m = await markInfo(page);
      assert.equal(m.count, 1, "exactly one end-mark");
      assert.equal(m.allLabelled, 1, "one 'End of article' in the whole page");
      assert.equal(await page.getByRole("img", { name: "End of article", exact: true }).count(), 1);
      assert.equal(m.role, "img");
      assert.equal(m.label, "End of article");
      assert.equal(m.bg, "rgb(226, 69, 47)");
      assert.equal(m.radius, "50%");
      assert.equal(m.textHasLabel, false, "the label is not text");
      assert.equal(m.insideCode, false, "never in a code block");
      assert.equal(await page.locator(".code-block .end-mark, pre .end-mark").count(), 0);
      assert.ok(
        Math.abs(m.w - m.fontSize * 0.5) < 0.6 && Math.abs(m.h - m.fontSize * 0.5) < 0.6,
        `about 0.5em: ${m.w}px of ${m.fontSize}px`,
      );
      assert.ok(Math.abs(m.baselineGap) < 0.6, `sits on the baseline (${m.baselineGap}px off)`);
      assert.equal(m.lastBlockIsParent, true, "after the last block of the post");
      if (!m.ownLine)
        assert.ok(
          Math.abs(m.marginLeft - m.fontSize * 0.35) < 0.6,
          `margin-left ${m.marginLeft}px`,
        );
      else assert.ok(Math.abs(m.markLeft - m.proseLeft) < 1, "on its own line, left-aligned");
      assert.deepEqual(
        problems().filter((p) => !/cloudinary|ERR_TUNNEL/.test(p)),
        [],
      );
      await ctx.close();
    });

  it("the two posts that end in text carry the point right after the last word, inside the last paragraph", async () => {
    for (const route of [INTRO, SETUP]) {
      const { ctx, page } = await openPage(env, route);
      const m = await markInfo(page);
      assert.equal(m.parentTag, "P", route);
      assert.equal(m.ownLine, false);
      assert.match(m.precededBy, /[.!)]$/, `after the last word: "${m.precededBy}"`);
      await ctx.close();
    }
    const { ctx, page } = await openPage(env, INTRO);
    assert.match(await page.locator(".prose-j > p:last-child").innerText(), /See you there!$/);
    await ctx.close();
  });

  it("the post that ends in a video gets the point on its own left-aligned line after it", async () => {
    const { ctx, page } = await openPage(env, EXT);
    const m = await markInfo(page);
    assert.equal(m.ownLine, true);
    assert.equal(m.parentTag, "P");
    assert.equal(
      await page.evaluate(
        () => document.querySelector(".end-mark-line").previousElementSibling.tagName,
      ),
      "VIDEO",
    );
    await ctx.close();
  });

  it("the point keeps its size and colour at every text size and in every theme", async () => {
    for (const size of ["standard", "comfortable", "large"]) {
      const { ctx, page } = await openPage(env, INTRO, {
        init: `localStorage.setItem("journal-prefs", JSON.stringify({theme:"batman",size:"${size}",width:"roomy"}))`,
      });
      const m = await markInfo(page);
      assert.equal(m.bg, "rgb(226, 69, 47)", size);
      assert.ok(Math.abs(m.w - m.fontSize * 0.5) < 0.6, `${size}: ${m.w} vs ${m.fontSize}`);
      await ctx.close();
    }
    const { ctx, page } = await openPage(env, INTRO);
    for (const id of THEMES) {
      await page.evaluate((t) => document.documentElement.setAttribute("data-theme", t), id);
      assert.equal(
        await page.evaluate(
          () => getComputedStyle(document.querySelector(".end-mark")).backgroundColor,
        ),
        "rgb(226, 69, 47)",
        id,
      );
    }
    await ctx.close();
  });

  const NOT_POSTS = ROUTES.filter((r) => !ARTICLES.includes(r));
  for (const route of NOT_POSTS)
    it(`${route}: no end-mark on a page that is not a post`, async () => {
      const { ctx, page } = await openPage(env, route);
      assert.equal(await page.locator(".end-mark, .end-mark-line").count(), 0);
      assert.equal(await page.locator('[aria-label="End of article"]').count(), 0);
      await ctx.close();
    });

  it("an unknown article URL reached by client navigation (not-found) has none either, and a post reached from home has exactly one", async () => {
    const { ctx, page } = await openPage(env, "/weblog/");
    await page.getByRole("link", { name: /Read the article/ }).click();
    await page.waitForURL(/\.html$/);
    // the URL changes a moment before the post renders: wait for the post itself
    await page.locator(".end-mark").waitFor();
    assert.equal(await page.locator(".end-mark").count(), 1);
    await page.evaluate(() => {
      history.pushState({}, "", "/weblog/2099/01/01/not-an-article.html");
      window.dispatchEvent(new PopStateEvent("popstate"));
    });
    await page.getByRole("heading", { name: "Back to the beginning." }).waitFor();
    assert.equal(await page.locator(".end-mark").count(), 0);
    await ctx.close();
  });

  it("is in the server-rendered HTML (no script needed) and the post text is otherwise untouched", async () => {
    const { ctx, page } = await openPage(env, INTRO);
    const html = await (await fetch(env.base + INTRO)).text();
    assert.equal((html.match(/class="end-mark"/g) ?? []).length, 1);
    assert.equal(await page.locator(".prose-j .end-mark").count(), 1);
    await ctx.close();
  });
});
