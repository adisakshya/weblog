// Pinned, gently condensing header (#78) against the BUILT static site under /weblog/, measured in a real browser at 320, 390
// and 1440px: it stays pinned and keeps its full single-line masthead, Meet Adi, Search and Appearance; it condenses past 64px
// and is restored within 8px (no jitter, no layout jump); anchors and keyboard focus never land under it; reduced motion
// removes the animation; popovers still fit short screens.
import { after, before, describe, it } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { ARTICLES, INTRO, SETUP, openPage, start } from "./helpers.mjs";

let env;
before(async () => {
  env = await start();
});
after(async () => {
  await env.stop();
});

const WIDTHS = [320, 390, 1440];
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
// Playwright's locator.tap()/click() scrolls an element "into view" by its static position, which wrongly scrolls the page for
// an element inside a pinned (sticky) header. A person taps what they see, so these tap the element's actual position.
const tapHeader = async (page, name) => {
  const b = await page.getByRole("button", { name }).boundingBox();
  await page.touchscreen.tap(b.x + b.width / 2, b.y + b.height / 2);
};
const settle = (page, ms = 350) => page.waitForTimeout(ms); // the 0.2s header transition + a frame

const header = (page) =>
  page.evaluate(() => {
    const h = document.querySelector(".j-header");
    const r = (e) => {
      const b = e.getBoundingClientRect();
      return { l: b.left, r: b.right, t: b.top, b: b.bottom, w: b.width, h: b.height };
    };
    const mast = document.querySelector(".j-masthead");
    const range = document.createRange();
    range.selectNodeContents(mast.querySelector(".j-masthead-name") ?? mast); // the visible name, not the seal that replaces it when condensed
    const lines = new Set([...range.getClientRects()].map((x) => Math.round(x.top))).size;
    const controls = {
      meet: document.querySelector(".j-meet"),
      search: document.querySelectorAll(".j-header-tool")[0],
      appearance: document.querySelectorAll(".j-header-tool")[1],
    };
    return {
      y: scrollY,
      vw: innerWidth,
      vh: innerHeight,
      pos: getComputedStyle(h).position,
      condensed: h.dataset.condensed === "true",
      header: r(h),
      mast: r(mast),
      lines,
      mastPx: parseFloat(getComputedStyle(mast).fontSize),
      controls: Object.fromEntries(Object.entries(controls).map(([k, e]) => [k, r(e)])),
      shadow: getComputedStyle(h).boxShadow,
      bg: getComputedStyle(h).backgroundColor,
      hVar: parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--j-header-h")),
      docOverflow: document.documentElement.scrollWidth > innerWidth,
    };
  });

describe("the header stays pinned with its full content, condenses on scroll and is restored near the top", () => {
  for (const w of WIDTHS)
    for (const route of ["/weblog/", INTRO])
      it(`${w}px ${route}: pinned at the top while scrolling; masthead on one line, Meet Adi, Search and Appearance all visible`, async () => {
        const { ctx, page, problems } = await openPage(env, route, {
          width: w,
          height: 800,
          touch: phone(w),
        });
        const top = await header(page);
        assert.equal(top.pos, "sticky");
        assert.equal(top.condensed, false, "full size at the top");
        for (const y of [200, 900, 1800]) {
          await page.evaluate((y) => scrollTo(0, y), y);
          await settle(page);
          const s = await header(page);
          assert.ok(s.y > 64, `scrolled to ${s.y}`);
          assert.equal(s.header.t, 0, `pinned at y=${s.y}`);
          assert.equal(s.condensed, true, "condensed while scrolled");
          assert.equal(s.lines, 1, "the full masthead stays on one line");
          assert.ok(s.mast.r <= s.vw + 0.5 && s.mast.l >= -0.5, "masthead inside the viewport");
          for (const [k, b] of Object.entries(s.controls)) {
            assert.ok(b.l >= -0.5 && b.r <= s.vw + 0.5, `${k} inside the viewport width`);
            assert.ok(b.t >= -0.5 && b.b <= s.header.b + 0.5, `${k} inside the pinned header`);
            assert.ok(b.h >= 44, `${k} keeps a 44px target`);
          }
          assert.ok(
            s.header.h < top.header.h - 8,
            `condensed ${s.header.h} < full ${top.header.h}`,
          );
          assert.ok(s.header.h > top.header.h - 48, "gently: not a collapse");
          assert.equal(s.docOverflow, false);
        }
        // masthead size: the script face eases from 27px to 23px on desktop; the compact serif keeps its size on phones
        const full = top.mastPx,
          cond = (await header(page)).mastPx;
        if (w >= 640) assert.deepEqual([full, cond], [27, 23]);
        else assert.equal(cond, full);
        // restored near the top, at exactly the original size
        await page.evaluate(() => scrollTo(0, 0));
        await settle(page);
        const back = await header(page);
        assert.equal(back.condensed, false);
        assert.equal(back.header.h, top.header.h, "restored to the full height");
        assert.equal(back.lines, 1);
        // the page content starts under the header (nothing hidden behind it at the top)
        assert.ok(
          await page.evaluate(
            () =>
              document.querySelector("main").getBoundingClientRect().top >=
              document.querySelector(".j-header").getBoundingClientRect().bottom - 0.5,
          ),
        );
        assert.deepEqual(problems(), []);
        await ctx.close();
      });

  it("the published --j-header-h always equals the rendered header height (full and condensed) and matches the pre-script default", async () => {
    for (const w of WIDTHS) {
      const { ctx, page } = await openPage(env, INTRO, { width: w, touch: phone(w) });
      const full = await header(page);
      assert.ok(
        Math.abs(full.hVar - full.header.h) < 0.5,
        `${w}px full: ${full.hVar} vs ${full.header.h}`,
      );
      // the CSS fallback (what applies before scripts run) must already be the real full height
      const fallback = await page.evaluate(() => {
        const el = document.documentElement;
        const inline = el.style.getPropertyValue("--j-header-h");
        el.style.removeProperty("--j-header-h");
        const v = parseFloat(getComputedStyle(el).getPropertyValue("--j-header-h"));
        el.style.setProperty("--j-header-h", inline);
        return v;
      });
      // The fallback describes the designed layout: the controls on one row. With wide fallback fonts (web fonts unavailable, as in
      // a sandbox or CI) the controls wrap to a second row at 320px and the header is taller; the published value still follows
      // the real height and a direct load on #anchor is placed again with it (covered by the anchor tests below).
      const oneRow = await page.evaluate(
        () => document.querySelector(".j-header-actions").getBoundingClientRect().height <= 46,
      );
      if (oneRow)
        assert.ok(
          Math.abs(fallback - full.header.h) < 0.5,
          `${w}px: CSS fallback ${fallback} vs real ${full.header.h}`,
        );
      await page.evaluate(() => scrollTo(0, 800));
      await settle(page);
      const c = await header(page);
      assert.ok(
        Math.abs(c.hVar - c.header.h) < 0.5,
        `${w}px condensed: ${c.hVar} vs ${c.header.h}`,
      );
      await ctx.close();
    }
  });

  for (const w of WIDTHS)
    it(`${w}px: threshold hysteresis, no jitter: one condense past 64px, one restore within 8px, nothing flips in between`, async () => {
      const { ctx, page } = await openPage(env, INTRO, { width: w, height: 800, touch: phone(w) });
      await page.evaluate(() => {
        window.__flips = [];
        const h = document.querySelector(".j-header");
        new MutationObserver(() =>
          window.__flips.push([Math.round(scrollY), h.dataset.condensed === "true"]),
        ).observe(h, { attributes: true, attributeFilter: ["data-condensed"] });
      });
      const step = async (y) => {
        await page.evaluate((y) => scrollTo(0, y), y);
        await page.waitForTimeout(60);
      };
      // down in 3px steps from 0 to 140
      for (let y = 0; y <= 140; y += 3) await step(y);
      await settle(page);
      const flipsDown = await page.evaluate(() => window.__flips.slice());
      assert.equal(flipsDown.length, 1, `one flip on the way down: ${JSON.stringify(flipsDown)}`);
      assert.equal(flipsDown[0][1], true);
      assert.ok(flipsDown[0][0] > 60 && flipsDown[0][0] <= 75, `condensed at ${flipsDown[0][0]}`);
      // back up in 3px steps: stays condensed through the whole 9..64 band, restores only within 8px
      await page.evaluate(() => (window.__flips.length = 0));
      let inBand = 0;
      for (let y = 140; y >= 0; y -= 3) {
        await step(y);
        const s = await header(page);
        if (s.y > 12 && s.y <= 60) {
          inBand++;
          assert.equal(s.condensed, true, `still condensed at y=${s.y}`);
        }
      }
      await settle(page);
      assert.ok(inBand > 5, `${inBand} samples inside the band`);
      const flipsUp = await page.evaluate(() => window.__flips.slice());
      assert.equal(flipsUp.length, 1, `one flip on the way up: ${JSON.stringify(flipsUp)}`);
      assert.equal(flipsUp[0][1], false);
      assert.ok(flipsUp[0][0] <= 12, `restored at ${flipsUp[0][0]}`);
      assert.equal((await header(page)).condensed, false);
      // hovering around the threshold must not oscillate: settle at 40px coming from below, then from above
      await step(40);
      await settle(page);
      assert.equal(
        (await header(page)).condensed,
        false,
        "40px coming from the top: not condensed",
      );
      await step(120);
      await step(40);
      await settle(page);
      assert.equal((await header(page)).condensed, true, "40px coming from below: condensed");
      await page.evaluate(() => (window.__flips.length = 0));
      await settle(page, 600);
      assert.equal(await page.evaluate(() => window.__flips.length), 0, "stable, no late flips");
      await ctx.close();
    });

  for (const w of WIDTHS)
    it(`${w}px: crossing the threshold does not make the page jump (content keeps its place under the finger)`, async () => {
      const { ctx, page } = await openPage(env, INTRO, { width: w, height: 800, touch: phone(w) });
      const probe = () =>
        page.evaluate(() => {
          const t = document.querySelector(".prose-j p");
          return { y: scrollY, top: t.getBoundingClientRect().top };
        });
      await page.evaluate(() => scrollTo(0, 50));
      await settle(page);
      const before = await probe();
      await page.evaluate(() => scrollTo(0, 90)); // crosses 64px: the header condenses
      await settle(page, 500);
      const after = await probe();
      assert.equal((await header(page)).condensed, true);
      // the page moved by what was scrolled and nothing else (tolerance: the browser's own scroll anchoring may use whole pixels)
      const jump = Math.abs(before.top - after.top - (after.y - before.y));
      assert.ok(
        jump <= 2,
        `content jumped by ${jump}px (y ${before.y}->${after.y}, top ${before.top}->${after.top})`,
      );
      // and back up across 8px
      const down = await probe();
      await page.evaluate(() => scrollTo(0, 4));
      await settle(page, 500);
      const up = await probe();
      assert.equal((await header(page)).condensed, false);
      const jump2 = Math.abs(down.top - up.top - (up.y - down.y));
      assert.ok(jump2 <= 2, `content jumped by ${jump2}px restoring`);
      await ctx.close();
    });

  it("client navigation to another page restores the full header at the top", async () => {
    const { ctx, page } = await openPage(env, "/weblog/", { width: 390, height: 800, touch: true });
    await page.evaluate(() => scrollTo(0, 700));
    await settle(page);
    assert.equal((await header(page)).condensed, true);
    await page.evaluate(() => (window.__spa = 1));
    await page.getByRole("link", { name: /Read the article/ }).click();
    await page.waitForURL(/\.html$/);
    await settle(page, 600);
    const s = await header(page);
    assert.equal(await page.evaluate(() => window.__spa), 1, "client navigation");
    assert.ok(s.y <= 8, `new page at the top (${s.y})`);
    assert.equal(s.condensed, false, "full header on the new page");
    assert.equal(s.header.t, 0);
    await ctx.close();
  });
});

describe("pinned in every theme, with a theme-aware shadow", () => {
  it("stays sticky (the superhero themes' relative positioning does not un-pin it), opaque, with a border and a condensed shadow", async () => {
    const { ctx, page } = await openPage(env, INTRO, { width: 390, height: 800, touch: true });
    await page.evaluate(() => scrollTo(0, 1500));
    await settle(page);
    const shadows = new Set();
    for (const id of THEMES) {
      await page.evaluate((t) => document.documentElement.setAttribute("data-theme", t), id);
      const r = await page.evaluate(() => {
        const h = document.querySelector(".j-header");
        const cs = getComputedStyle(h);
        return {
          pos: cs.position,
          top: h.getBoundingClientRect().top,
          bg: cs.backgroundColor,
          want: getComputedStyle(document.querySelector(".journal")).getPropertyValue("--j-bg"),
          border: cs.borderBottomWidth,
          borderColor: cs.borderBottomColor,
          shadow: cs.boxShadow,
          z: cs.zIndex,
        };
      });
      assert.equal(r.pos, "sticky", `${id}: sticky`);
      assert.equal(r.top, 0, `${id}: pinned`);
      assert.notEqual(r.bg, "rgba(0, 0, 0, 0)", `${id}: opaque background`);
      assert.equal(r.border, "1px", `${id}: border`);
      assert.notEqual(r.shadow, "none", `${id}: shadow while condensed`);
      assert.ok(Number(r.z) >= 40, `${id}: above the content`);
      shadows.add(r.shadow);
    }
    assert.ok(shadows.size >= 2, "the shadow follows the theme's colours");
    // and no shadow at the top of the page
    await page.evaluate(() => scrollTo(0, 0));
    await settle(page);
    assert.equal((await header(page)).shadow, "none");
    await ctx.close();
  });

  it("every route type keeps the header pinned (home, about, tag, series, articles)", async () => {
    for (const route of [
      "/weblog/",
      "/weblog/about/",
      "/weblog/tags/api-gateway/",
      "/weblog/series/api-gateway-101/",
      ...ARTICLES,
    ]) {
      const { ctx, page } = await openPage(env, route, { width: 390, height: 500, touch: true });
      await page.evaluate(() => scrollTo(0, document.documentElement.scrollHeight));
      await settle(page);
      const s = await header(page);
      assert.equal(s.pos, "sticky", route);
      assert.equal(s.header.t, 0, `${route}: pinned at y=${s.y}`);
      await ctx.close();
    }
  });
});

describe("anchors and keyboard focus are never hidden under the pinned header", () => {
  const firstHeadings = (page) =>
    page.evaluate(() =>
      [...document.querySelectorAll(".prose-j h2[id], .prose-j h3[id]")]
        .slice(0, 6)
        .map((h) => h.id),
    );
  for (const w of WIDTHS)
    for (const route of [INTRO, SETUP])
      it(`${w}px ${route}: a direct load on #heading lands below the header, and so do in-page jumps`, async () => {
        const probe = await openPage(env, route, { width: w, height: 800, touch: phone(w) });
        const ids = await firstHeadings(probe.page);
        await probe.ctx.close();
        assert.ok(ids.length >= 2, `${ids.length} anchored headings`);
        for (const id of [ids[0], ids[ids.length - 1]]) {
          const { ctx, page } = await openPage(env, `${route}#${id}`, {
            width: w,
            height: 800,
            touch: phone(w),
          });
          await settle(page, 600);
          const m = await page.evaluate((id) => {
            const e = document.getElementById(id);
            return {
              y: scrollY,
              top: e.getBoundingClientRect().top,
              hb: document.querySelector(".j-header").getBoundingClientRect().bottom,
            };
          }, id);
          assert.ok(m.y > 0, `#${id}: the page scrolled to the anchor (y=${m.y})`);
          assert.ok(
            m.top >= m.hb - 0.5,
            `#${id}: heading top ${m.top} is below the header (${m.hb})`,
          );
          assert.ok(m.top - m.hb < 60, `#${id}: and close to it (${m.top - m.hb}px gap)`);
          await ctx.close();
        }
        // in-page jump to a heading by its hash (an anchor link / the browser's own hash navigation)
        const { ctx, page } = await openPage(env, route, {
          width: w,
          height: 800,
          touch: phone(w),
        });
        for (const id of ids.slice(0, 4)) {
          await page.evaluate((id) => (location.hash = id), id);
          await settle(page, 500);
          const m = await page.evaluate((id) => {
            const e = document.getElementById(id);
            return {
              top: e.getBoundingClientRect().top,
              hb: document.querySelector(".j-header").getBoundingClientRect().bottom,
            };
          }, id);
          assert.ok(m.top >= m.hb - 0.5, `jump to #${id}: ${m.top} below header ${m.hb}`);
        }
        await ctx.close();
      });

  it("the skip link still lands on the main content", async () => {
    const { ctx, page } = await openPage(env, INTRO, { width: 390, height: 800, touch: true });
    await page.evaluate(() => scrollTo(0, 1000));
    await settle(page);
    await page.keyboard.press("Tab");
    assert.equal(
      await page.evaluate(() => document.activeElement.textContent.trim()),
      "Skip to content",
    );
    await page.keyboard.press("Enter");
    await settle(page);
    const m = await page.evaluate(() => ({
      main: document.querySelector("#main").getBoundingClientRect().top,
      hb: document.querySelector(".j-header").getBoundingClientRect().bottom,
    }));
    assert.ok(
      m.main >= m.hb - 0.5 || m.main <= 0,
      "the skip link target is not covered by the header",
    );
    await ctx.close();
  });

  for (const w of WIDTHS)
    it(`${w}px: tabbing backwards up a long article never focuses something under the header`, async () => {
      const { ctx, page } = await openPage(env, SETUP, { width: w, height: 700, touch: phone(w) });
      await page.locator("footer a").first().focus();
      await settle(page, 200);
      const rows = [];
      for (let i = 0; i < 30; i++) {
        await page.keyboard.press("Shift+Tab");
        const s = await page.evaluate(() => {
          const a = document.activeElement,
            b = a.getBoundingClientRect(),
            h = document.querySelector(".j-header");
          return {
            text: (a.textContent || a.tagName).trim().slice(0, 30),
            inHeader: h.contains(a),
            top: b.top,
            bottom: b.bottom,
            hb: h.getBoundingClientRect().bottom,
            y: scrollY,
          };
        });
        rows.push(s);
        if (s.inHeader) break;
        assert.ok(
          s.top >= s.hb - 0.5,
          `"${s.text}" focused at ${s.top}, under the header (${s.hb})`,
        );
        // an element taller than the room under the header (a large image) cannot fit whole; it is top-aligned below the header
        const fits = s.bottom - s.top <= 700 - s.hb - 12;
        assert.ok(
          !fits || s.bottom <= 700 + 1,
          `"${s.text}" (${s.top}..${s.bottom}, header ends ${s.hb}) is inside the viewport`,
        );
      }
      assert.ok(
        rows.filter((r) => !r.inHeader).length >= 8,
        "tabbed through many focusable elements",
      );
      await ctx.close();
    });

  it("the header controls keep a visible focus ring while condensed, and stay fully on screen", async () => {
    for (const w of WIDTHS) {
      const { ctx, page } = await openPage(env, INTRO, { width: w, height: 700, touch: phone(w) });
      await page.evaluate(() => scrollTo(0, 1200));
      await settle(page);
      await page.locator("#main a").first().focus();
      // from inside the page, Shift+Tab goes up to the header controls
      const seen = [];
      for (let i = 0; i < 12 && seen.length < 3; i++) {
        await page.keyboard.press("Shift+Tab");
        const s = await page.evaluate(() => {
          const a = document.activeElement,
            cs = getComputedStyle(a),
            b = a.getBoundingClientRect();
          return {
            inHeader: !!a.closest(".j-header"),
            text: a.textContent.trim().replace(/\s+/g, " ").slice(0, 20),
            outline: cs.outlineStyle,
            width: parseFloat(cs.outlineWidth),
            top: b.top,
            bottom: b.bottom,
            l: b.left,
            r: b.right,
            vw: innerWidth,
          };
        });
        if (s.inHeader) seen.push(s);
      }
      assert.ok(seen.length >= 3, `${w}px: reached ${seen.map((s) => s.text)}`);
      for (const s of seen) {
        assert.notEqual(s.outline, "none", `${w}px ${s.text}: outline`);
        assert.ok(s.width >= 2, `${w}px ${s.text}: ring ${s.width}px`);
        assert.ok(s.top >= 0 && s.l >= 0 && s.r <= s.vw, `${w}px ${s.text}: on screen`);
      }
      await ctx.close();
    }
  });
});

describe("reduced motion and safe areas", () => {
  it("with reduced motion the header does not animate, yet it still condenses and restores", async () => {
    const { ctx, page } = await openPage(env, INTRO, {
      width: 1440,
      height: 800,
      reducedMotion: "reduce",
    });
    const durations = () =>
      page.evaluate(() =>
        [".j-header", ".j-header-inner", ".j-masthead"].map((s) => {
          const cs = getComputedStyle(document.querySelector(s));
          return [s, cs.transitionDuration, cs.animationDuration];
        }),
      );
    for (const [s, t, a] of await durations()) {
      assert.match(t, /^(0s)(, 0s)*$/, `${s} transition ${t}`);
      assert.match(a, /^(0s)(, 0s)*$/, `${s} animation ${a}`);
    }
    await page.evaluate(() => scrollTo(0, 900));
    await page.waitForTimeout(80); // far less than the 200ms animation: the change is immediate
    const s = await header(page);
    assert.equal(s.condensed, true);
    const fullH = (await header(page)).header.h;
    await page.evaluate(() => scrollTo(0, 0));
    await page.waitForTimeout(80);
    assert.equal((await header(page)).condensed, false);
    assert.ok((await header(page)).header.h > fullH, "restored at once");
    await ctx.close();
    // and without the preference it eases (0.2s)
    const normal = await openPage(env, INTRO, { width: 1440, height: 800 });
    const d = await normal.page.evaluate(
      () => getComputedStyle(document.querySelector(".j-header-inner")).transitionDuration,
    );
    assert.match(d, /0\.2s/, `normal motion: ${d}`);
    await normal.ctx.close();
  });

  it("the header and footer padding honour the device safe areas (the built CSS carries env(safe-area-inset-*))", () => {
    const dir = "dist/client/assets";
    const css = readdirSync(dir)
      .filter((f) => f.endsWith(".css"))
      .map((f) => readFileSync(`${dir}/${f}`, "utf8"))
      .join("\n");
    for (const side of ["top", "left", "right", "bottom"])
      assert.ok(css.includes(`safe-area-inset-${side}`), `safe-area-inset-${side}`);
    // minified output may or may not keep the spaces; compare without them
    const norm = css.replace(/\s+/g, "");
    assert.match(
      norm,
      /\.j-header-inner\{[^}]*padding-block:max\(16px,env\(safe-area-inset-top\)\)16px/,
    );
    assert.match(
      norm,
      /\.j-header\[data-condensed\]\.j-header-inner\{[^}]*padding-block:max\(8px,env\(safe-area-inset-top\)\)8px/,
    );
  });

  it("with no device inset the header keeps its designed padding (16px, 8px when condensed)", async () => {
    const { ctx, page } = await openPage(env, INTRO, { width: 390, height: 800, touch: true });
    const pad = () =>
      page.evaluate(() => {
        const cs = getComputedStyle(document.querySelector(".j-header-inner"));
        return [parseFloat(cs.paddingTop), parseFloat(cs.paddingBottom)];
      });
    assert.deepEqual(await pad(), [16, 16]);
    await page.evaluate(() => scrollTo(0, 900));
    await settle(page);
    assert.deepEqual(await pad(), [8, 8]);
    await ctx.close();
  });
});

describe("popovers and dialogs on short screens with the pinned header", () => {
  for (const [w, h] of [
    [320, 568],
    [390, 500],
    [667, 375],
  ])
    it(`${w}x${h}: Appearance opens below the (condensed) header, fits the screen, scrolls, and the page does not jump`, async () => {
      const { ctx, page, problems } = await openPage(env, INTRO, {
        width: w,
        height: h,
        touch: true,
      });
      await page.evaluate(() => scrollTo(0, 1500));
      await settle(page);
      const before = await header(page);
      assert.equal(before.condensed, true);
      await tapHeader(page, /Appearance/);
      await page.locator(".j-appearance").waitFor();
      await settle(page, 250);
      const m = await page.evaluate(() => {
        const p = document.querySelector(".j-appearance"),
          b = p.getBoundingClientRect(),
          t = [...document.querySelectorAll(".j-header-tool")][1].getBoundingClientRect(),
          hd = document.querySelector(".j-header").getBoundingClientRect();
        return {
          top: b.top,
          bottom: b.bottom,
          l: b.left,
          r: b.right,
          trigger: t.bottom,
          hdTop: hd.top,
          hdBottom: hd.bottom,
          vh: innerHeight,
          vw: innerWidth,
          scrolls: p.scrollHeight > p.clientHeight,
          y: scrollY,
        };
      });
      assert.ok(
        m.top >= m.trigger - 1,
        `panel ${m.top} sits below its trigger (${m.trigger}), not over the header`,
      );
      assert.ok(m.top >= m.hdBottom - 1, "and below the pinned header");
      assert.ok(m.bottom <= m.vh + 0.5, `panel bottom ${m.bottom} within ${m.vh}`);
      assert.ok(m.l >= 0 && m.r <= m.vw + 0.5);
      assert.equal(m.hdTop, 0, "the header stays pinned while the panel is open");
      assert.ok(Math.abs(m.y - before.y) < 2, "opening the panel did not move the page");
      // the whole panel is reachable: scroll to its end and the last control is fully visible
      const last = await page.evaluate(() => {
        const p = document.querySelector(".j-appearance");
        p.scrollTop = p.scrollHeight;
        const lastLabel = [...p.querySelectorAll("label")].pop(),
          b = lastLabel.getBoundingClientRect(),
          pb = p.getBoundingClientRect();
        return { ok: b.bottom <= pb.bottom + 1 && b.top >= pb.top - 1 };
      });
      assert.ok(last.ok, "the last control can be scrolled fully into view");
      await page.keyboard.press("Escape");
      await page.locator(".j-appearance").waitFor({ state: "hidden" });
      assert.equal(
        await page.evaluate(() => document.activeElement.textContent.includes("Appearance")),
        true,
        "focus returns to Appearance",
      );
      assert.deepEqual(problems(), []);
      await ctx.close();
    });

  for (const [w, h] of [
    [320, 568],
    [667, 375],
  ])
    it(`${w}x${h}: the Search dialog fits the screen from the condensed header`, async () => {
      const { ctx, page } = await openPage(env, INTRO, { width: w, height: h, touch: true });
      await page.evaluate(() => scrollTo(0, 1500));
      await settle(page);
      await tapHeader(page, /Search/);
      const dlg = page.getByRole("dialog");
      await dlg.waitFor();
      const b = await dlg.evaluate((e) => {
        const r = e.getBoundingClientRect();
        return { t: r.top, b: r.bottom, l: r.left, r: r.right, vh: innerHeight, vw: innerWidth };
      });
      assert.ok(b.t >= 0 && b.b <= b.vh + 0.5 && b.l >= 0 && b.r <= b.vw + 0.5, JSON.stringify(b));
      await page.keyboard.press("Escape");
      await ctx.close();
    });
});
