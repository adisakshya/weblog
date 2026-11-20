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

describe("footer: Follow Adi and grouped links (#76)", () => {
  const CONTACT = "/weblog/contact/";
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
      const links = (sel) =>
        [...document.querySelectorAll(sel)].map((a) => ({
          text: a.textContent.trim().replace(/\s+/g, " "),
          href: a.getAttribute("href"),
          rel: a.rel,
          ...box(a),
          bg: getComputedStyle(a).backgroundColor,
          border: getComputedStyle(a).borderTopWidth,
        }));
      const h = (t) =>
        [...document.querySelectorAll("footer h2")].find((e) => e.textContent.trim() === t);
      const groupLinks = (t) =>
        [...h(t).parentElement.querySelectorAll("a")].map((a) => ({
          text: a.textContent.trim(),
          href: a.getAttribute("href"),
        }));
      return {
        headings: [...document.querySelectorAll("footer h2")].map((e) => e.textContent.trim()),
        follow: links('footer nav[aria-label="Follow Adi"] a'),
        explore: groupLinks("Explore"),
        help: groupLinks("Get in touch & help"),
        bottom: [...document.querySelectorAll(".j-footer-bottom p")].map((p) => ({
          text: p.textContent.trim().replace(/\s+/g, " "),
          ...box(p),
          fs: parseFloat(getComputedStyle(p).fontSize),
          color: getComputedStyle(p).color,
        })),
        source: links(".j-footer-bottom a")[0],
        all: links("footer a"),
        followBox: box(document.querySelector('footer section[aria-labelledby="follow-adi"]')),
        groupsBox: box(document.querySelector(".j-footer-groups")),
        exploreBox: box(h("Explore")),
        helpBox: box(h("Get in touch & help")),
        docOverflow: document.documentElement.scrollWidth > innerWidth,
        muted: getComputedStyle(document.querySelector(".j-muted")).color,
        linkFs: parseFloat(getComputedStyle(document.querySelector(".j-footer-groups a")).fontSize),
      };
    });

  it("groups the links, keeps the exact existing destinations and puts credits in a quiet bottom row", async () => {
    const { ctx, page } = await openPage(env, CONTACT, { width: 1440 });
    const f = await footer(page);
    assert.deepEqual(f.headings, ["Follow Adi", "Explore", "Get in touch & help"]);
    assert.deepEqual(
      f.follow.map((l) => [l.text, l.href]),
      [
        ["LinkedIn", "https://www.linkedin.com/in/adisakshya/"],
        ["Twitter/X", "https://twitter.com/adisakshya"],
        ["GitHub", "https://github.com/adisakshya"],
      ],
    );
    assert.deepEqual(f.explore, [
      { text: "Home", href: "/weblog/" },
      { text: "Subjects", href: "/weblog/?view=subjects" },
      { text: "Index", href: "/weblog/?view=index" },
    ]);
    assert.deepEqual(f.help, [
      { text: "Contact", href: "/weblog/contact" },
      { text: "Email", href: "mailto:adisakshya98@gmail.com" },
      { text: "Terms & policies", href: "/weblog/terms" },
    ]);
    assert.equal(f.source.href, "https://github.com/adisakshya/weblog");
    assert.equal(f.source.text, "View source");
    assert.match(f.bottom[0].text, /^© \d{4} Adisakshya Chauhan$/);
    assert.match(f.bottom[1].text, /^Built in New Delhi, India · View source$/);
    // quieter: smaller than the link groups and in the muted colour
    for (const p of f.bottom) {
      assert.ok(p.fs < f.linkFs, `bottom row ${p.fs}px is quieter than the links (${f.linkFs}px)`);
      assert.equal(p.color, f.muted, "muted colour");
    }
    // every external destination opens safely
    for (const l of f.all.filter((l) => /^https?:/.test(l.href)))
      assert.equal(l.rel, "noopener noreferrer", l.href);
    await ctx.close();
  });

  it("LinkedIn is the primary (filled) action; Twitter/X and GitHub are secondary (outlined)", async () => {
    const { ctx, page } = await openPage(env, CONTACT, { width: 1440 });
    const { follow } = await footer(page);
    assert.notEqual(follow[0].bg, "rgba(0, 0, 0, 0)", "LinkedIn is filled");
    for (const l of follow.slice(1)) {
      assert.equal(l.bg, "rgba(0, 0, 0, 0)", `${l.text} is not filled`);
      assert.equal(l.border, "1px");
    }
    await ctx.close();
  });

  it("every internal footer link goes where it says (and Email is a mailto)", async () => {
    const { ctx, page } = await openPage(env, CONTACT);
    const go = (name) => page.locator("footer").getByRole("link", { name, exact: true }).click();
    // wait for the destination's own content (the URL changes a moment before the new page renders)
    const pressed = (label) =>
      page
        .locator('[aria-label="Choose view"] [aria-pressed="true"]')
        .filter({ hasText: new RegExp(`^${label}$`) })
        .waitFor();
    await go("Terms & policies");
    await page.waitForURL(/\/weblog\/terms\/?$/);
    await page.locator("h1").filter({ hasText: /Terms/i }).first().waitFor();
    await go("Contact");
    await page.waitForURL(/\/weblog\/contact\/?$/);
    await page.getByText("Have a question for me?").first().waitFor();
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

  it("mobile layout is stacked: Follow Adi above the link groups, LinkedIn on its own row, the two groups side by side, credits stacked", async () => {
    const { ctx, page } = await openPage(env, CONTACT, { width: 390, touch: true });
    const f = await footer(page);
    assert.ok(f.followBox.b <= f.groupsBox.t + 1, "Follow Adi is above the groups");
    const [li, tw, gh] = f.follow;
    assert.ok(tw.t >= li.b - 1, "Twitter/X is below LinkedIn");
    assert.ok(Math.abs(tw.t - gh.t) < 1 && tw.r <= gh.l + 1, "Twitter/X and GitHub share a row");
    assert.ok(
      Math.abs(f.exploreBox.t - f.helpBox.t) < 1 && f.exploreBox.l < f.helpBox.l,
      "Explore and Get in touch & help sit side by side",
    );
    assert.ok(f.bottom[1].t >= f.bottom[0].b - 1, "credits are stacked");
    await ctx.close();
  });

  it("desktop layout groups the links: Follow Adi beside the two groups, credits split left and right in one quiet row", async () => {
    const { ctx, page } = await openPage(env, CONTACT, { width: 1440 });
    const f = await footer(page);
    assert.ok(f.followBox.r <= f.groupsBox.l + 1, "Follow Adi sits left of the groups");
    assert.ok(Math.abs(f.followBox.t - f.groupsBox.t) < 2, "same top");
    assert.ok(Math.abs(f.exploreBox.t - f.helpBox.t) < 1 && f.exploreBox.l < f.helpBox.l);
    const [c, built] = f.bottom;
    assert.ok(built.l > c.r, "copyright left, credit right");
    assert.ok(Math.abs(c.t + c.h / 2 - (built.t + built.h / 2)) < 12, "one row");
    await ctx.close();
  });

  it("keyboard: all footer links are reachable in reading order, each with a visible focus ring", async () => {
    const { ctx, page } = await openPage(env, CONTACT, { width: 1440 });
    const order = [];
    for (let i = 0; i < 60 && order.length < 10; i++) {
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
      [
        "LinkedIn",
        "Twitter/X",
        "GitHub",
        "Home",
        "Subjects",
        "Index",
        "Contact",
        "Email",
        "Terms & policies",
        "View source",
      ],
    );
    for (const s of order) {
      assert.notEqual(s.outline, "none", `${s.text}: has a focus outline`);
      assert.ok(s.width >= 2, `${s.text}: outline ${s.width}px`);
    }
    await ctx.close();
  });
});
