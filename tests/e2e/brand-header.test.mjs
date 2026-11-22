// The आदि header (#83) against the BUILT static site under /weblog/: the masthead reads "Adisakshya Chauhan" at the top of the page
// and the seal takes its place once the header condenses; the name and the seal never show together; the header's height, the
// published --j-header-h and the 64/8px hysteresis are exactly what #78 built; the seal follows all 12 themes.
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

const NAME = "Adisakshya Chauhan";
const WIDTHS = [320, 360, 390, 430, 640, 1024, 1440];
const phone = (w) => w < 768;
const settle = (page, ms = 400) => page.waitForTimeout(ms);
// what the header gives up when it condenses (padding, gap and, on tablets, the masthead row): measured in #78
const delta = (w) => (w >= 1024 ? 20 : w >= 640 ? 28 : 22);

const state = (page) =>
  page.evaluate(() => {
    const box = (e) => {
      const b = e.getBoundingClientRect();
      return { l: b.left, r: b.right, t: b.top, b: b.bottom, w: b.width, h: b.height };
    };
    const link = document.querySelector(".j-masthead");
    const name = document.querySelector(".j-masthead-name");
    const seal = document.querySelector(".j-masthead-seal");
    const hdr = document.querySelector(".j-header");
    const range = document.createRange();
    range.selectNodeContents(name);
    const lines = new Set([...range.getClientRects()].map((r) => Math.round(r.top))).size;
    const shown = (e) => {
      const cs = getComputedStyle(e);
      return cs.visibility !== "hidden" && Number(cs.opacity) > 0.99;
    };
    const hidden = (e) => {
      const cs = getComputedStyle(e);
      return cs.visibility === "hidden" || Number(cs.opacity) === 0;
    };
    const [search, appearance] = [...document.querySelectorAll(".j-header-tool")];
    return {
      vw: innerWidth,
      y: scrollY,
      condensed: hdr.dataset.condensed === "true",
      text: name.textContent,
      lines,
      textW: range.getBoundingClientRect().width,
      linkBox: box(link),
      sealBox: box(seal),
      sealSvgBox: box(seal.querySelector("svg")),
      header: box(hdr),
      hVar: parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--j-header-h")),
      nameShown: shown(name),
      nameHidden: hidden(name),
      sealShown: shown(seal),
      sealHidden: hidden(seal),
      ariaLabel: link.getAttribute("aria-label"),
      sealAria: seal.getAttribute("aria-hidden"),
      sealTitle: seal.getAttribute("title"),
      family: getComputedStyle(name).fontFamily.split(",")[0].replace(/["']/g, "").trim(),
      meet: box(document.querySelector(".j-meet")),
      search: box(search),
      appearance: box(appearance),
      docOverflow: document.documentElement.scrollWidth > innerWidth,
      transform: getComputedStyle(seal).transform,
    };
  });

describe("name-only masthead at the top of the page", () => {
  for (const w of WIDTHS)
    it(`${w}px: reads "${NAME}" on one line in the right face, fits, and does not touch Meet Adi, Search or Appearance`, async () => {
      const { ctx, page, problems } = await openPage(env, INTRO, {
        width: w,
        height: 800,
        touch: phone(w),
      });
      const s = await state(page);
      assert.equal(s.text, NAME);
      assert.equal(s.lines, 1, "one line");
      assert.ok(s.textW <= s.linkBox.w + 0.5, `text ${s.textW}px fits its ${s.linkBox.w}px box`);
      assert.equal(s.docOverflow, false, "no horizontal overflow");
      // the script face at every width (previously fell back to the serif face below 640px,
      // which silently broke on iPhone Safari and Android Chrome)
      assert.equal(s.family, "Agustina");
      assert.equal(s.nameShown, true, "the name is visible at the top");
      assert.equal(s.sealHidden, true, "the seal is not visible at the top");
      for (const k of ["meet", "search", "appearance"]) {
        assert.ok(s[k].l >= -0.5 && s[k].r <= w + 0.5, `${k} inside the viewport`);
        assert.ok(s[k].h >= 44, `${k} keeps a 44px target`);
      }
      // the name's text does not run into the controls (same row on wide screens, a different row on phones)
      const nameRight = s.linkBox.l + s.textW;
      const sameRow = s.meet.t < s.linkBox.b && s.meet.b > s.linkBox.t;
      if (sameRow) assert.ok(nameRight <= s.meet.l + 0.5, "the name ends before Meet Adi");
      assert.deepEqual(problems(), []);
      await ctx.close();
    });

  it('no "The blog of" text is left in the header', async () => {
    const { ctx, page } = await openPage(env, INTRO);
    assert.equal(
      await page.evaluate(() =>
        document.querySelector(".j-header").textContent.includes("The blog of"),
      ),
      false,
    );
    await ctx.close();
  });
});

describe("the seal replaces the name when the header condenses", () => {
  for (const w of WIDTHS)
    it(`${w}px: only the seal is visible when condensed, the name is back at the top, one box, never side by side`, async () => {
      const { ctx, page } = await openPage(env, INTRO, { width: w, height: 800, touch: phone(w) });
      const top = await state(page);
      await page.evaluate(() => scrollTo(0, 900));
      await settle(page);
      const c = await state(page);
      assert.equal(c.condensed, true);
      assert.equal(c.sealShown, true, "the seal is visible");
      assert.equal(c.nameHidden, true, "the name is not visible");
      assert.equal(top.nameShown && top.sealHidden, true);
      // the seal sits in the masthead's own box: inside it, left-aligned with the name's start
      assert.ok(Math.abs(c.sealBox.l - c.linkBox.l) <= 3, "starts where the name started");
      assert.ok(c.sealBox.b <= c.header.b && c.sealBox.t >= c.header.t - 1, "inside the header");
      assert.ok(Math.abs(c.sealBox.w - c.sealBox.h) < 1.5, "a square");
      // the drawing fills the seal's box (it is not shrunk by some other rule)
      assert.ok(
        Math.abs(c.sealSvgBox.w - c.sealBox.w) < 3 && Math.abs(c.sealSvgBox.h - c.sealBox.h) < 3,
        `the SVG (${c.sealSvgBox.w}px) fills the seal (${c.sealBox.w}px)`,
      );
      // the seal never overlaps the controls
      if (c.meet.t < c.sealBox.b && c.meet.b > c.sealBox.t) assert.ok(c.sealBox.r <= c.meet.l);
      // header height: exactly what #78 built (the same delta, the same published --j-header-h), no threshold jitter
      assert.ok(
        Math.abs(top.header.h - c.header.h - delta(w)) < 0.5,
        `condensed ${c.header.h} = full ${top.header.h} - ${delta(w)}`,
      );
      assert.ok(
        Math.abs(c.hVar - c.header.h) < 0.5,
        `--j-header-h ${c.hVar} vs rendered ${c.header.h}`,
      );
      // back near the top: the name is back, the seal is gone, and the height is restored exactly
      await page.evaluate(() => scrollTo(0, 0));
      await settle(page);
      const back = await state(page);
      assert.equal(back.condensed, false);
      assert.equal(back.nameShown && back.sealHidden, true);
      assert.equal(back.header.h, top.header.h);
      await ctx.close();
    });

  it("exactly one of name and seal is shown at every scroll position once the 150ms crossfade has finished, with one flip each way", async () => {
    const { ctx, page } = await openPage(env, INTRO, { width: 390, height: 800, touch: true });
    await page.evaluate(() => {
      window.__flips = [];
      const h = document.querySelector(".j-header");
      new MutationObserver(() =>
        window.__flips.push([Math.round(scrollY), h.dataset.condensed === "true"]),
      ).observe(h, { attributes: true, attributeFilter: ["data-condensed"] });
    });
    for (const y of [0, 20, 40, 60, 80, 140, 80, 40, 20, 4, 0]) {
      await page.evaluate((y) => scrollTo(0, y), y);
      await settle(page, 260); // longer than the 150ms crossfade
      const s = await state(page);
      assert.equal(
        s.nameShown !== s.sealShown,
        true,
        `y=${s.y}: exactly one is fully shown (name ${s.nameShown}, seal ${s.sealShown})`,
      );
      assert.equal(s.nameHidden !== s.sealHidden, true, `y=${s.y}: exactly one is hidden`);
    }
    const f = await page.evaluate(() => window.__flips);
    assert.equal(f.length, 2, `one condense and one restore: ${JSON.stringify(f)}`);
    assert.equal(f[0][1], true);
    assert.equal(f[1][1], false);
    assert.ok(
      f[0][0] > 60 && f[1][0] <= 12,
      `thresholds at about 64px and 8px: ${JSON.stringify(f)}`,
    );
    await ctx.close();
  });

  for (const w of [390, 1440])
    it(`${w}px: crossing the threshold does not move the page content`, async () => {
      const { ctx, page } = await openPage(env, INTRO, { width: w, height: 800, touch: phone(w) });
      const probe = () =>
        page.evaluate(() => ({
          y: scrollY,
          top: document.querySelector(".prose-j p").getBoundingClientRect().top,
        }));
      await page.evaluate(() => scrollTo(0, 50));
      await settle(page);
      const a = await probe();
      await page.evaluate(() => scrollTo(0, 90));
      await settle(page, 500);
      const b = await probe();
      assert.ok(Math.abs(a.top - b.top - (b.y - a.y)) <= 2, "no jump condensing");
      await page.evaluate(() => scrollTo(0, 4));
      await settle(page, 500);
      const c = await probe();
      assert.ok(Math.abs(b.top - c.top - (c.y - b.y)) <= 2, "no jump restoring");
      await ctx.close();
    });

  it("the seal is tilted -3 degrees in the header, carries the Adi tooltip, and is hidden from assistive technology", async () => {
    const { ctx, page } = await openPage(env, INTRO, { width: 1440, height: 800 });
    await page.evaluate(() => scrollTo(0, 900));
    await settle(page);
    const s = await state(page);
    const [a, b] = s.transform.match(/-?\d+\.?\d*(?:e-?\d+)?/g).map(Number);
    const deg = (Math.atan2(b, a) * 180) / Math.PI;
    assert.ok(Math.abs(deg + 3) < 0.1, `rotation ${deg}deg`);
    assert.equal(s.sealTitle, "Adi");
    assert.equal(s.sealAria, "true");
    await ctx.close();
  });
});

describe("accessible name, keyboard and motion", () => {
  for (const w of [390, 1440])
    it(`${w}px: the masthead link is named "${NAME}" in both states, once`, async () => {
      const { ctx, page } = await openPage(env, INTRO, { width: w, touch: phone(w) });
      const named = () => page.locator(".j-header").getByRole("link", { name: NAME, exact: true });
      assert.equal(await named().count(), 1, "one link with that name at the top");
      assert.equal(await named().getAttribute("href"), "/weblog/");
      await page.evaluate(() => scrollTo(0, 900));
      await settle(page);
      assert.equal(await named().count(), 1, "and when condensed");
      assert.equal((await state(page)).ariaLabel, NAME);
      // the seal adds no second name: it is hidden from assistive technology
      assert.equal(await page.locator(".j-header .j-masthead-seal[aria-hidden='true']").count(), 1);
      await ctx.close();
    });

  it("keyboard order is unchanged (skip link, masthead, Meet Adi, Search, Appearance) and the focus ring shows in both states", async () => {
    for (const scrolled of [false, true]) {
      const { ctx, page } = await openPage(env, INTRO, { width: 1440, height: 800 });
      if (scrolled) {
        await page.evaluate(() => scrollTo(0, 900));
        await settle(page);
      }
      await page.evaluate(() => document.activeElement.blur());
      const order = [];
      for (let i = 0; i < 5; i++) {
        await page.keyboard.press("Tab");
        order.push(
          await page.evaluate(() => {
            const a = document.activeElement,
              cs = getComputedStyle(a);
            return {
              text: a.textContent.trim().replace(/\s+/g, " ").slice(0, 20),
              label: a.getAttribute("aria-label"),
              outline: cs.outlineStyle,
              width: parseFloat(cs.outlineWidth),
            };
          }),
        );
      }
      assert.deepEqual(
        order.map((o) => o.label ?? o.text),
        ["Skip to content", NAME, "Meet Adi", "Search/", "Aa Appearance"],
        scrolled ? "condensed" : "top",
      );
      for (const o of order.slice(1)) {
        assert.notEqual(o.outline, "none", `${o.label ?? o.text}: focus outline`);
        assert.ok(o.width >= 2, `${o.label ?? o.text}: ring ${o.width}px`);
      }
      await ctx.close();
    }
  });

  it("the crossfade is 150ms at most, and prefers-reduced-motion removes it while the swap still happens", async () => {
    const read = (page) =>
      page.evaluate(() =>
        [".j-masthead-name", ".j-masthead-seal"].map(
          (s) => getComputedStyle(document.querySelector(s)).transitionDuration,
        ),
      );
    const normal = await openPage(env, INTRO, { width: 1440, height: 800 });
    for (const d of await read(normal.page)) {
      const max = Math.max(...d.split(",").map((x) => parseFloat(x)));
      assert.ok(max > 0 && max <= 0.15, `crossfade ${d}`);
    }
    await normal.ctx.close();
    const reduced = await openPage(env, INTRO, {
      width: 1440,
      height: 800,
      reducedMotion: "reduce",
    });
    for (const d of await read(reduced.page)) assert.match(d, /^(0s)(, 0s)*$/);
    await reduced.page.evaluate(() => scrollTo(0, 900));
    await reduced.page.waitForTimeout(60); // far less than any animation: the swap is immediate
    const s = await state(reduced.page);
    assert.equal(s.sealShown, true);
    assert.equal(s.nameHidden, true);
    await reduced.ctx.close();
  });
});

describe("the seal follows every theme", () => {
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
  const measure = (page, theme) =>
    page.evaluate((theme) => {
      document.documentElement.setAttribute("data-theme", theme);
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
        return (x + 0.05) / (y + 0.05);
      };
      const seal = document.querySelector(".j-masthead-seal");
      const root = getComputedStyle(document.querySelector(".journal"));
      const fill = (sel) => px(getComputedStyle(seal.querySelector(sel)).fill);
      const tile = fill("rect"),
        glyph = fill("g > g"),
        point = fill("circle");
      return {
        theme,
        tile,
        glyph,
        point,
        fg: px(root.getPropertyValue("--j-fg")),
        bg: px(root.getPropertyValue("--j-bg")),
        pointVsTile: +ratio(point, tile).toFixed(2),
        glyphVsTile: +ratio(glyph, tile).toFixed(2),
      };
    }, theme);

  it("tile = --j-fg, glyph = --j-bg and the point is #E2452F in all themes; only Dune and Deep Sea override the tile; the point is at least 3:1 against the tile everywhere", async () => {
    const { ctx, page } = await openPage(env, INTRO, { width: 1440, height: 800 });
    await page.evaluate(() => scrollTo(0, 900));
    await settle(page);
    const OVERRIDE = { "solarized-light": [31, 42, 48], "solarized-dark": [237, 243, 244] };
    for (const id of THEMES) {
      const m = await measure(page, id);
      assert.deepEqual(m.point, [226, 69, 47], `${id}: the point is #E2452F`);
      assert.deepEqual(m.glyph, m.bg, `${id}: glyph = --j-bg`);
      assert.deepEqual(
        m.tile,
        OVERRIDE[id] ?? m.fg,
        `${id}: tile ${OVERRIDE[id] ? "is the documented override" : "= --j-fg"}`,
      );
      assert.ok(m.pointVsTile >= 3, `${id}: point vs tile ${m.pointVsTile}:1`);
      assert.ok(m.glyphVsTile >= 4.5, `${id}: glyph vs tile ${m.glyphVsTile}:1`);
    }
    await ctx.close();
  });

  it("System resolves to Daylight or Graphite and the seal follows", async () => {
    for (const [scheme, tile] of [
      ["light", [27, 27, 34]],
      ["dark", [238, 238, 238]],
    ]) {
      const { ctx, page } = await openPage(env, INTRO, {
        width: 1440,
        colorScheme: scheme,
        init: `localStorage.setItem("journal-prefs", JSON.stringify({theme:"system",size:"comfortable",width:"roomy"}))`,
      });
      await page.evaluate(() => scrollTo(0, 900));
      await settle(page);
      const m = await measure(
        page,
        await page.evaluate(() => document.documentElement.dataset.theme),
      );
      assert.deepEqual(m.tile, tile, scheme);
      await ctx.close();
    }
  });
});

describe("server-rendered: both states are in the HTML, so hydration changes nothing", () => {
  const html = () => readFileSync("dist/client/index.html", "utf8");
  it("the prerendered home page carries the name and the seal, exactly as committed, and no condensed state", () => {
    const h = html();
    assert.match(h, /<span class="j-masthead-name">Adisakshya Chauhan<\/span>/);
    assert.match(h, /class="adi-seal j-masthead-seal"/);
    assert.ok(
      h.includes(readFileSync("docs/brand/assets/adi-seal-themeable.svg", "utf8").trim()),
      "the committed SVG is inlined byte for byte",
    );
    assert.doesNotMatch(h, /data-condensed/);
    assert.doesNotMatch(h, /<img[^>]+adi-seal/);
  });
  for (const w of [390, 1440])
    it(`${w}px: with scripts disabled the header is exactly as tall as the hydrated one (no layout shift)`, async () => {
      const heights = [];
      for (const javaScriptEnabled of [false, true]) {
        const ctx = await env.browser.newContext({
          viewport: { width: w, height: 800 },
          javaScriptEnabled,
        });
        await ctx.route(/fonts\.(googleapis|gstatic|cdnfonts)\.com/, (r) => r.abort());
        const page = await ctx.newPage();
        await page.goto(env.base + "/weblog/", { waitUntil: "networkidle" });
        heights.push(
          await page.evaluate(() => {
            const h = document.querySelector(".j-header").getBoundingClientRect();
            const m = document.querySelector("main").getBoundingClientRect();
            return [h.height, m.top];
          }),
        );
        await ctx.close();
      }
      assert.deepEqual(heights[0], heights[1], "header height and where the page starts");
    });
});
