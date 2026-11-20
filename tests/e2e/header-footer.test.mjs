// Masthead / header actions (#74) and footer (#76) against the BUILT static site under /weblog/.
// Layout is measured in a real browser at the issue's widths; destinations are asserted exactly.
import { after, before, describe, it } from "node:test";
import assert from "node:assert/strict";
import { INTRO, openPage, start } from "./helpers.mjs";

let env;
before(async () => {
  env = await start();
});
after(async () => {
  await env.stop();
});

const WIDTHS = [320, 375, 390, 430, 768, 1440];
const phone = (w) => w < 768;

// What each width must show: compact serif on narrow screens, the script face from 640px, at the mockup's sizes.
const mastheadSpec = (w) =>
  w >= 640
    ? { family: "Agustina", px: 27 }
    : { family: "Source Serif 4", px: w >= 430 ? 23 : w >= 360 ? 20 : 18 };

/** Geometry of the header, measured in the page. */
const measureHeader = (page) =>
  page.evaluate(() => {
    const rect = (e) => {
      const b = e.getBoundingClientRect();
      return { l: b.left, r: b.right, t: b.top, b: b.bottom, w: b.width, h: b.height };
    };
    const mast = document.querySelector(".j-masthead");
    const range = document.createRange();
    range.selectNodeContents(mast);
    const lineTops = new Set([...range.getClientRects()].map((r) => Math.round(r.top)));
    const cs = getComputedStyle(mast);
    const meet = document.querySelector(".j-meet");
    const [search, appearance] = [...document.querySelectorAll(".j-header-tool")];
    const inner = document.querySelector(".j-header-inner");
    return {
      vw: innerWidth,
      docOverflow: document.documentElement.scrollWidth > innerWidth,
      innerOverflow: inner.scrollWidth > inner.clientWidth + 1,
      lines: lineTops.size,
      textW: range.getBoundingClientRect().width,
      mastW: mast.clientWidth,
      family: cs.fontFamily.split(",")[0].replace(/["']/g, "").trim(),
      px: parseFloat(cs.fontSize),
      mast: rect(mast),
      meet: rect(meet),
      search: rect(search),
      appearance: rect(appearance),
    };
  });

const overlaps = (a, b) => a.l < b.r - 0.5 && b.l < a.r - 0.5 && a.t < b.b - 0.5 && b.t < a.b - 0.5;

describe("masthead and header actions (#74)", () => {
  // CI's first run found a real gap: with the web fonts unavailable the controls fall back to a wider face (DejaVu Sans on
  // the runner) and overlapped at 320px. They must wrap to a second row instead of overlapping or leaving the viewport.
  for (const w of WIDTHS) {
    it(`${w}px: with a wide fallback face the controls wrap instead of overlapping`, async () => {
      const { ctx, page } = await openPage(env, INTRO, {
        width: w,
        height: 800,
        touch: phone(w),
      });
      await page.addStyleTag({
        content:
          '.j-header-tool, .j-meet { font-family: "DejaVu Sans", Verdana, sans-serif !important; letter-spacing: 0.02em; }',
      });
      const m = await measureHeader(page);
      assert.equal(m.docOverflow, false, "no horizontal page overflow");
      for (const k of ["meet", "search", "appearance"]) {
        assert.ok(
          m[k].l >= -0.5 && m[k].r <= m.vw + 0.5,
          `${k} inside the viewport (${m[k].l.toFixed(1)}..${m[k].r.toFixed(1)} of ${m.vw})`,
        );
      }
      assert.equal(
        overlaps(m.meet, m.search) ||
          overlaps(m.search, m.appearance) ||
          overlaps(m.meet, m.appearance),
        false,
        "controls do not overlap",
      );
      await ctx.close();
    });
  }

  for (const w of WIDTHS) {
    it(`${w}px: the full masthead is on one line and nothing is clipped or overflowing`, async () => {
      const { ctx, page, problems } = await openPage(env, INTRO, {
        width: w,
        height: 800,
        touch: phone(w),
      });
      const m = await measureHeader(page);
      assert.equal(m.lines, 1, "masthead is a single line");
      assert.ok(
        m.textW <= m.mastW + 0.5,
        `text ${m.textW.toFixed(1)}px fits its ${m.mastW}px column`,
      );
      assert.equal(m.docOverflow, false, "no horizontal page overflow");
      assert.equal(m.innerOverflow, false, "header content fits its container");
      const spec = mastheadSpec(w);
      assert.deepEqual(
        { family: m.family, px: m.px },
        spec,
        "masthead face and size for this width",
      );
      for (const k of ["meet", "search", "appearance"]) {
        assert.ok(
          m[k].l >= -0.5 && m[k].r <= m.vw + 0.5,
          `${k} inside the viewport (${m[k].l.toFixed(1)}..${m[k].r.toFixed(1)} of ${m.vw})`,
        );
        assert.ok(m[k].h >= 44, `${k} is ${m[k].h}px tall (>= 44px tap target)`);
      }
      assert.equal(
        overlaps(m.meet, m.search) ||
          overlaps(m.search, m.appearance) ||
          overlaps(m.meet, m.appearance),
        false,
        "controls do not overlap",
      );
      assert.equal(
        overlaps(m.mast, m.meet) || overlaps(m.mast, m.search) || overlaps(m.mast, m.appearance),
        false,
        "masthead does not overlap the controls",
      );
      assert.deepEqual(problems(), []);
      await ctx.close();
    });
  }

  it("zoomed in (200% / 300% on a phone is a 195px / 130px layout) nothing is clipped, nothing overflows horizontally", async () => {
    for (const w of [240, 195, 130]) {
      const { ctx, page } = await openPage(env, INTRO, { width: w, height: 800, touch: true });
      const m = await measureHeader(page);
      assert.equal(m.docOverflow, false, `${w}px: no horizontal page overflow`);
      for (const k of ["mast", "meet", "search", "appearance"])
        assert.ok(
          m[k].l >= -0.5 && m[k].r <= m.vw + 0.5,
          `${w}px: ${k} inside the viewport (${m[k].l.toFixed(1)}..${m[k].r.toFixed(1)})`,
        );
      await ctx.close();
    }
  });

  it("zoom stays available (the viewport does not forbid scaling)", async () => {
    const { ctx, page } = await openPage(env, INTRO, { width: 390, touch: true });
    const viewport = await page.evaluate(
      () => document.querySelector('meta[name="viewport"]').content,
    );
    assert.doesNotMatch(viewport, /user-scalable\s*=\s*(no|0)|maximum-scale\s*=\s*1(\.0)?\b/);
    await ctx.close();
  });

  it("with enlarged text (root font size 200%) the header controls remain usable and inside the viewport", async () => {
    for (const w of [320, 390]) {
      const { ctx, page } = await openPage(env, INTRO, {
        width: w,
        height: 800,
        touch: true,
        fontScale: 2,
      });
      await page.waitForFunction(() => document.documentElement.style.fontSize === "200%");
      const m = await measureHeader(page);
      assert.equal(m.docOverflow, false, `${w}px, large text: no horizontal overflow`);
      for (const k of ["meet", "search", "appearance"])
        assert.ok(
          m[k].l >= -0.5 && m[k].r <= m.vw + 0.5 && m[k].h >= 44,
          `${w}px, large text: ${k} usable`,
        );
      await ctx.close();
    }
  });

  it("Meet Adi is the filled primary action with the personal-site destination; Search and Appearance are secondary", async () => {
    const { ctx, page } = await openPage(env, INTRO, { width: 390, touch: true });
    const d = await page.evaluate(() => {
      const meet = document.querySelector(".j-meet");
      const [search, appearance] = [...document.querySelectorAll(".j-header-tool")];
      const s = (e) => ({
        bg: getComputedStyle(e).backgroundColor,
        border: getComputedStyle(e).borderTopWidth,
        role: e.tagName,
      });
      return {
        href: meet.getAttribute("href"),
        rel: meet.rel,
        text: meet.textContent.trim(),
        meet: s(meet),
        search: s(search),
        appearance: s(appearance),
        inPrimaryNav: !!meet.closest('nav[aria-label="Primary"]'),
      };
    });
    assert.equal(d.href, "https://adisakshya.github.io/", "the existing personal-site destination");
    assert.equal(d.rel, "noopener noreferrer");
    assert.equal(d.text, "Meet Adi");
    assert.equal(d.meet.role, "A");
    assert.ok(d.inPrimaryNav);
    assert.notEqual(d.meet.bg, "rgba(0, 0, 0, 0)", "Meet Adi has a solid fill");
    for (const k of ["search", "appearance"]) {
      assert.equal(d[k].bg, "rgba(0, 0, 0, 0)", `${k} is outlined, not filled`);
      assert.equal(d[k].border, "1px");
    }
    await ctx.close();
  });

  it("keyboard order is skip link, masthead, Meet Adi, Search, Appearance, each with a visible focus ring", async () => {
    const { ctx, page } = await openPage(env, INTRO, { width: 1440 });
    const seen = [];
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press("Tab");
      seen.push(
        await page.evaluate(() => {
          const a = document.activeElement,
            cs = getComputedStyle(a);
          return {
            text: a.textContent.trim().replace(/\s+/g, " "),
            outline: cs.outlineStyle,
            width: parseFloat(cs.outlineWidth),
          };
        }),
      );
    }
    assert.deepEqual(
      seen.map((s) => s.text),
      ["Skip to content", "The blog of Adisakshya Chauhan", "Meet Adi", "Search/", "Aa Appearance"],
    );
    for (const s of seen) {
      assert.notEqual(s.outline, "none", `${s.text}: has an outline`);
      assert.ok(s.width >= 2, `${s.text}: outline ${s.width}px`);
    }
    await ctx.close();
  });

  it("navigation: the masthead returns home (client-side), `/` opens search, Appearance opens its panel", async () => {
    const { ctx, page } = await openPage(env, INTRO);
    await page.evaluate(() => (window.__spa = 1));
    await page.getByRole("link", { name: "The blog of Adisakshya Chauhan" }).click();
    await page.waitForURL(/\/weblog\/$/);
    assert.equal(await page.evaluate(() => window.__spa), 1, "client navigation, no reload");
    await page.keyboard.press("/");
    await page.getByRole("dialog").waitFor();
    await page.keyboard.press("Escape");
    await page.getByRole("button", { name: /Appearance/ }).click();
    await page.locator(".j-appearance").waitFor();
    await ctx.close();
  });
});

describe("footer: Follow Adi, Explore and the credit (#80)", () => {
  const CONTACT = "/weblog/contact/";
  const SOURCE = "https://github.com/adisakshya/weblog";
  const PILLS = [
    ["LinkedIn", "https://www.linkedin.com/in/adisakshya/"],
    ["Twitter/X", "https://twitter.com/adisakshya"],
    ["GitHub", "https://github.com/adisakshya"],
  ];
  const THEME_IDS = [
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

  /** Everything the footer tests read, measured in the page (document coordinates). */
  const footer = (page) =>
    page.evaluate(() => {
      const box = (e) => {
        const b = e.getBoundingClientRect();
        return {
          l: b.left,
          r: b.right,
          t: b.top + scrollY,
          b: b.bottom + scrollY,
          w: b.width,
          h: b.height,
        };
      };
      const norm = (t) => t.textContent.trim().replace(/\s+/g, " ");
      const link = (a) => {
        const cs = getComputedStyle(a);
        return {
          text: norm(a),
          href: a.getAttribute("href"),
          rel: a.rel,
          ...box(a),
          bg: cs.backgroundColor,
          color: cs.color,
          radius: parseFloat(cs.borderTopLeftRadius),
          padL: parseFloat(cs.paddingLeft),
          padR: parseFloat(cs.paddingRight),
          fs: parseFloat(cs.fontSize),
          fw: cs.fontWeight,
          shadow: cs.boxShadow,
          svgs: a.querySelectorAll("svg").length,
        };
      };
      const h2 = (t) => [...document.querySelectorAll("footer h2")].find((e) => norm(e) === t);
      const meta = document.querySelector(".j-footer-meta");
      const inner = document.querySelector(".j-footer-inner");
      return {
        headings: [...document.querySelectorAll("footer h2")].map((e) => ({
          text: norm(e),
          fs: parseFloat(getComputedStyle(e).fontSize),
        })),
        follow: [...document.querySelectorAll('footer nav[aria-label="Follow Adi"] a')].map(link),
        explore: [...document.querySelectorAll('footer nav[aria-label="Explore"] a')].map(link),
        navs: [...document.querySelectorAll("footer nav")].map((n) => n.getAttribute("aria-label")),
        all: [...document.querySelectorAll("footer a")].map(link),
        metaText: [...meta.querySelectorAll("p")].map((p) => ({
          text: norm(p),
          inner: p.innerText.trim(),
          ...box(p),
          fs: parseFloat(getComputedStyle(p).fontSize),
          color: getComputedStyle(p).color,
        })),
        credit: [...meta.querySelectorAll("a")].map(link),
        metaBox: box(meta),
        metaBorderTop: getComputedStyle(meta).borderTopWidth,
        dividers: [...document.querySelectorAll("footer *")].filter(
          (e) =>
            e !== meta &&
            (parseFloat(getComputedStyle(e).borderTopWidth) > 0 ||
              parseFloat(getComputedStyle(e).borderBottomWidth) > 0) &&
            e.getBoundingClientRect().width > 100 &&
            e.tagName !== "A",
        ).length,
        followBox: box(h2("Follow Adi").parentElement),
        exploreBox: box(h2("Explore").parentElement),
        innerBox: box(inner),
        innerPadL: parseFloat(getComputedStyle(inner).paddingLeft),
        docOverflow: document.documentElement.scrollWidth > innerWidth,
        text: document.querySelector("footer").innerText,
      };
    });

  it("has exactly Follow Adi and Explore, the existing destinations, and no Contact, Email or Terms links", async () => {
    const { ctx, page } = await openPage(env, CONTACT, { width: 1440 });
    const f = await footer(page);
    assert.deepEqual(
      f.headings.map((h) => h.text),
      ["Follow Adi", "Explore"],
    );
    assert.deepEqual(f.navs, ["Follow Adi", "Explore"]);
    assert.deepEqual(
      f.follow.map((l) => [l.text, l.href]),
      PILLS,
    );
    assert.deepEqual(
      f.explore.map((l) => [l.text, l.href]),
      [
        ["Home", "/weblog/"],
        ["Subjects", "/weblog/?view=subjects"],
        ["Index", "/weblog/?view=index"],
      ],
    );
    for (const gone of [
      "Contact",
      "Email",
      "Terms",
      "Get in touch",
      "help",
      "New Delhi",
      "View source",
    ])
      assert.ok(!f.text.includes(gone), `the footer no longer says "${gone}"`);
    for (const l of f.all) {
      assert.ok(!/\/contact|\/terms|^mailto:/.test(l.href), `no footer link to ${l.href}`);
    }
    assert.equal(f.all.length, 7, "LinkedIn, X, GitHub, Home, Subjects, Index, Open source");
    // external destinations open safely
    for (const l of f.all.filter((l) => /^https?:/.test(l.href)))
      assert.equal(l.rel, "noopener noreferrer", l.href);
    await ctx.close();
  });

  it("the credit is exactly the copyright and 'Made with love. Open source.' with 'Open source' as the one source link", async () => {
    const { ctx, page } = await openPage(env, CONTACT, { width: 1440 });
    const f = await footer(page);
    assert.equal(f.metaText.length, 2);
    assert.match(f.metaText[0].text, /^© \d{4} Adisakshya Chauhan$/);
    assert.equal(f.metaText[1].text, "Made with love. Open source.");
    assert.equal(f.metaText[1].inner, "Made with love. Open source.", "also as rendered text");
    assert.deepEqual(
      f.credit.map((l) => [l.text, l.href, l.rel]),
      [["Open source", SOURCE, "noopener noreferrer"]],
      "one link in the credit, to the weblog repository",
    );
    assert.equal(
      f.all.filter((l) => l.href === SOURCE).length,
      1,
      "the repository is linked exactly once in the footer",
    );
    await ctx.close();
  });

  it("Follow Adi and Explore headings are 1rem (16px at the default root size, and they scale with it)", async () => {
    const { ctx, page } = await openPage(env, CONTACT, { width: 1440 });
    for (const h of (await footer(page)).headings) assert.equal(h.fs, 16, h.text);
    await ctx.close();
    const big = await openPage(env, CONTACT, { width: 1440, fontScale: 2 });
    await big.page.waitForFunction(() => document.documentElement.style.fontSize === "200%");
    for (const h of (await footer(big.page)).headings) assert.equal(h.fs, 32, `${h.text} at 200%`);
    await big.ctx.close();
  });

  it("LinkedIn, Twitter/X and GitHub are identical filled pills: LinkedIn keeps its fill, X is #0b0b0d, GitHub is #24292f", async () => {
    const { ctx, page } = await openPage(env, CONTACT, { width: 1440 });
    const { follow } = await footer(page);
    const accent = await page.evaluate(() => {
      const c = document.createElement("canvas").getContext("2d");
      c.fillStyle = getComputedStyle(document.querySelector(".journal")).getPropertyValue(
        "--j-accent",
      );
      return c.fillStyle;
    });
    const rgb = (hex) => {
      const n = parseInt(hex.slice(1), 16);
      return `rgb(${n >> 16}, ${(n >> 8) & 255}, ${n & 255})`;
    };
    const toCss = (hex) => rgb(hex);
    assert.equal(follow[0].bg, toCss(accent), "LinkedIn keeps the existing accent fill");
    assert.equal(follow[1].bg, "rgb(11, 11, 13)", "X near-black #0b0b0d");
    assert.equal(follow[2].bg, "rgb(36, 41, 47)", "GitHub dark slate #24292f");
    for (const l of follow) {
      assert.ok(l.h >= 44, `${l.text} is ${l.h}px tall`);
      assert.ok(l.radius >= l.h / 2, `${l.text} is fully rounded`);
      assert.notEqual(l.bg, "rgba(0, 0, 0, 0)", `${l.text} is filled`);
    }
    const [a, ...rest] = follow;
    for (const l of rest) {
      assert.equal(l.h, a.h, `${l.text}: same height as LinkedIn`);
      assert.equal(l.padL, a.padL, `${l.text}: same padding`);
      assert.equal(l.padR, a.padR);
      assert.equal(l.radius, a.radius, `${l.text}: same radius`);
      assert.equal(l.fs, a.fs, `${l.text}: same font size`);
      assert.equal(l.fw, a.fw, `${l.text}: same weight`);
    }
    for (const l of follow.slice(1)) assert.equal(l.color, "rgb(255, 255, 255)", `${l.text} text`);
    // labels and icons preserved: brand icon + label + arrow (LinkedIn, GitHub), label + arrow (X)
    assert.deepEqual(
      follow.map((l) => l.svgs),
      [2, 1, 2],
    );
    await ctx.close();
  });

  it("contrast and boundaries hold in every light and dark theme (text 4.5:1, focus ring and pill boundary 3:1)", async () => {
    const { ctx, page } = await openPage(env, CONTACT, { width: 1440 });
    const rows = [];
    for (const id of THEME_IDS) {
      await page.evaluate((t) => document.documentElement.setAttribute("data-theme", t), id);
      rows.push(
        await page.evaluate((id) => {
          const px = (css, under) => {
            const c = document.createElement("canvas");
            c.width = c.height = 1;
            const x = c.getContext("2d");
            x.fillStyle = under || "#000";
            x.fillRect(0, 0, 1, 1);
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
          const panel = px(getComputedStyle(document.querySelector(".j-footer")).backgroundColor);
          const solid = (css, under) => px(css, `rgb(${under.join(",")})`);
          const out = { id, dark: matchMedia("(prefers-color-scheme: dark)").matches && false };
          const name = (a) => a.textContent.trim().replace(/\s+/g, " ").split(" ")[0];
          for (const a of document.querySelectorAll('footer nav[aria-label="Follow Adi"] a')) {
            const cs = getComputedStyle(a);
            const fill = solid(cs.backgroundColor, panel);
            out[`${name(a)}:text`] = ratio(solid(cs.color, fill), fill);
            out[`${name(a)}:fillVsPanel`] = ratio(fill, panel);
            // the ring (inset 1px box-shadow) is drawn over the fill; its colour against the panel is the visible boundary
            const m = cs.boxShadow.match(/(rgba?\([^)]*\)|color\([^)]*\))/);
            out[`${name(a)}:ring`] = m ? ratio(solid(m[1], fill), panel) : 0;
            const focus = getComputedStyle(document.querySelector(".journal")).getPropertyValue(
              "--j-focus",
            );
            out[`${name(a)}:focusVsPanel`] = ratio(px(focus), panel);
          }
          for (const sel of [
            ".j-footer-label",
            ".j-footer-meta p",
            ".j-footer-links a:not(.j-footer-primary):not(.j-footer-pill)",
            ".j-footer-meta a",
          ]) {
            const e = document.querySelector(`footer ${sel}`);
            out[sel] = ratio(solid(getComputedStyle(e).color, panel), panel);
          }
          return out;
        }, id),
      );
    }
    for (const r of rows) {
      for (const n of ["LinkedIn", "Twitter/X", "GitHub"]) {
        assert.ok(r[`${n}:text`] >= 4.5, `${r.id}: ${n} text ${r[`${n}:text`]}:1`);
        assert.ok(r[`${n}:focusVsPanel`] >= 3, `${r.id}: focus ring ${r[`${n}:focusVsPanel`]}:1`);
        assert.ok(
          Math.max(r[`${n}:fillVsPanel`], r[`${n}:ring`]) >= 3,
          `${r.id}: ${n} boundary: fill ${r[`${n}:fillVsPanel`]}:1, ring ${r[`${n}:ring`]}:1`,
        );
      }
      for (const sel of [
        ".j-footer-label",
        ".j-footer-meta p",
        ".j-footer-links a:not(.j-footer-primary):not(.j-footer-pill)",
        ".j-footer-meta a",
      ])
        assert.ok(r[sel] >= 4.5, `${r.id}: ${sel} ${r[sel]}:1`);
    }
    await ctx.close();
  });

  it("every internal footer link goes where it says, and Contact and Terms stay available on their direct routes", async () => {
    const { ctx, page } = await openPage(env, "/weblog/about/");
    const go = (name) => page.locator("footer").getByRole("link", { name, exact: true }).click();
    // wait for the destination's own content (the URL changes a moment before the new page renders)
    const pressed = (label) =>
      page
        .locator('[aria-label="Choose view"] [aria-pressed="true"]')
        .filter({ hasText: new RegExp(`^${label}$`) })
        .waitFor();
    await go("Subjects");
    await page.waitForURL(/\/weblog\/\?view=subjects$/);
    await pressed("Subjects");
    await go("Index");
    await page.waitForURL(/\/weblog\/\?view=index$/);
    await pressed("Index");
    await go("Home");
    await page.waitForURL(/\/weblog\/$/);
    await pressed("Posts");
    await ctx.close();
    // the routes and their content are untouched, they are only not linked from the footer
    const terms = await openPage(env, "/weblog/terms/");
    await terms.page.locator("h1").filter({ hasText: /Terms/i }).first().waitFor();
    await terms.ctx.close();
    const contact = await openPage(env, CONTACT);
    await contact.page.getByText("Have a question for me?").first().waitFor();
    assert.equal(
      await contact.page
        .locator("footer")
        .getByRole("link", { name: /Contact|Terms|Email/ })
        .count(),
      0,
    );
    await contact.ctx.close();
  });

  for (const w of [320, 390, 768, 1440]) {
    it(`${w}px: footer fits the viewport and every link is a comfortable touch target`, async () => {
      const { ctx, page } = await openPage(env, CONTACT, { width: w, touch: phone(w) });
      const f = await footer(page);
      assert.equal(f.docOverflow, false, "no horizontal overflow");
      for (const l of f.all) {
        assert.ok(l.l >= -0.5 && l.r <= w + 0.5, `${l.text} inside the viewport`);
        // height: the 44px comfortable target; width: at least the WCAG 2.2 AA minimum (short words like "Home" are narrower than 44px by design)
        assert.ok(l.h >= 44, `${l.text}: ${l.h}px tall`);
        assert.ok(l.w >= 24, `${l.text}: ${l.w}px wide`);
      }
      await ctx.close();
    });
  }

  for (const w of [320, 390]) {
    it(`${w}px (mobile): groups stack, Home / Subjects / Index sit in one row, the pills wrap naturally without overlap`, async () => {
      const { ctx, page } = await openPage(env, CONTACT, { width: w, touch: true });
      const f = await footer(page);
      assert.ok(f.exploreBox.t >= f.followBox.b - 1, "Explore is stacked below Follow Adi");
      assert.ok(f.followBox.l - f.innerBox.l <= f.innerPadL + 1, "groups start at the left edge");
      const tops = new Set(f.explore.map((l) => Math.round(l.t)));
      assert.equal(tops.size, 1, "Home, Subjects and Index share one horizontal row");
      for (let i = 1; i < f.explore.length; i++)
        assert.ok(f.explore[i].l >= f.explore[i - 1].r - 0.5, "in order, no overlap");
      // pills: in reading order, never overlapping, each fully visible; a pill that does not fit moves to the next row
      for (let i = 0; i < f.follow.length; i++) {
        const a = f.follow[i];
        assert.ok(a.l >= 0 && a.r <= w, `${a.text} inside the viewport`);
        for (const b of f.follow.slice(i + 1)) {
          const sepX = a.r <= b.l + 0.5 || b.r <= a.l + 0.5;
          const sepY = a.b <= b.t + 0.5 || b.b <= a.t + 0.5;
          assert.ok(sepX || sepY, `${a.text} and ${b.text} do not overlap`);
        }
      }
      assert.ok(f.follow[1].t >= f.follow[0].t - 1, "reading order is preserved when wrapping");
      await ctx.close();
    });
  }

  it("1440px (desktop): Follow Adi and Explore sit side by side, grouped closely, in the content column", async () => {
    const { ctx, page } = await openPage(env, CONTACT, { width: 1440 });
    const f = await footer(page);
    assert.ok(f.followBox.r <= f.exploreBox.l + 1, "Follow Adi is left of Explore");
    assert.ok(Math.abs(f.followBox.t - f.exploreBox.t) < 2, "same top");
    const gap = f.exploreBox.l - f.followBox.r;
    assert.ok(gap > 0 && gap <= 80, `grouped closely: ${gap}px apart`);
    assert.ok(f.exploreBox.r <= f.innerBox.r, "inside the content column");
    assert.equal(new Set(f.explore.map((l) => Math.round(l.t))).size, 1, "Explore links in a row");
    assert.equal(new Set(f.follow.map((l) => Math.round(l.t))).size, 1, "the three pills in a row");
    await ctx.close();
  });

  for (const w of [320, 390, 1440]) {
    it(`${w}px: copyright and 'Made with love. Open source.' sit together, left-aligned, under one divider`, async () => {
      const { ctx, page } = await openPage(env, CONTACT, { width: w, touch: phone(w) });
      const f = await footer(page);
      assert.equal(f.metaBorderTop, "1px", "the credit sits under one divider");
      assert.equal(f.dividers, 0, "and there is no other divider in the footer");
      const [c, m] = f.metaText;
      assert.ok(c.t >= f.metaBox.t && m.b <= f.metaBox.b + 0.5, "both inside the divided block");
      assert.ok(
        Math.abs(c.l - (f.innerBox.l + f.innerPadL)) < 1,
        "copyright starts at the left edge",
      );
      if (w >= 390 + 100) {
        // wide: one row, left aligned (not pushed to the right edge)
        assert.ok(Math.abs(c.t - m.t) < 12, "one row");
        assert.ok(m.l >= c.r && m.l - c.r <= 40, `together: ${m.l - c.r}px apart`);
        assert.ok(m.r < f.innerBox.r - 200, "left-aligned, not spread to the right edge");
      } else {
        assert.ok(Math.abs(m.l - c.l) < 1 || m.t >= c.b - 1, "stacked or aligned left");
      }
      // the Open source link keeps a 44px target and the text can wrap naturally without overflow
      assert.ok(f.credit[0].h >= 44, `Open source link ${f.credit[0].h}px tall`);
      assert.equal(f.docOverflow, false);
      await ctx.close();
    });
  }

  it("zoomed or with large text the footer wraps naturally without horizontal overflow", async () => {
    for (const [w, scale] of [
      [195, 1],
      [130, 1],
      [320, 2],
      [390, 2],
    ]) {
      const { ctx, page } = await openPage(env, CONTACT, {
        width: w,
        touch: true,
        fontScale: scale,
      });
      if (scale > 1)
        await page.waitForFunction(
          (s) => document.documentElement.style.fontSize === `${s * 100}%`,
          scale,
        );
      const f = await footer(page);
      assert.equal(f.docOverflow, false, `${w}px x${scale}: no horizontal overflow`);
      for (const l of f.all)
        assert.ok(l.l >= -0.5 && l.r <= w + 0.5, `${w}px x${scale}: ${l.text}`);
      await ctx.close();
    }
  });

  it("keyboard: all footer links are reachable in reading order, each with a visible focus ring", async () => {
    const { ctx, page } = await openPage(env, CONTACT, { width: 1440 });
    const order = [];
    for (let i = 0; i < 60 && order.length < 7; i++) {
      await page.keyboard.press("Tab");
      const s = await page.evaluate(() => {
        const a = document.activeElement,
          cs = getComputedStyle(a);
        return {
          inFooter: !!a.closest("footer"),
          text: a.textContent.trim().replace(/\s+/g, " "),
          outline: cs.outlineStyle,
          width: parseFloat(cs.outlineWidth),
        };
      });
      if (s.inFooter) order.push(s);
    }
    assert.deepEqual(
      order.map((s) => s.text),
      ["LinkedIn", "Twitter/X", "GitHub", "Home", "Subjects", "Index", "Open source"],
    );
    for (const s of order) {
      assert.notEqual(s.outline, "none", `${s.text}: has a focus outline`);
      assert.ok(s.width >= 2, `${s.text}: outline ${s.width}px`);
    }
    await ctx.close();
  });
});
