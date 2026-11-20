// Reading controls (#75, revised by #79) against the BUILT static site under /weblog/.
// The article font is fixed to the default serif; Text size and Article width are offered only on valid individual article
// pages; Theme is offered everywhere. What the reader actually sees (computed article body font, size and measure) must follow
// the controls immediately and persist across navigation, reload and direct entry, including with an older saved payload.
import { after, before, describe, it } from "node:test";
import assert from "node:assert/strict";
import { ARTICLES, EXT, INTRO, SETUP, openPage, start } from "./helpers.mjs";

let env;
before(async () => {
  env = await start();
});
after(async () => {
  await env.stop();
});

// Default root font size (16px): Standard 1.125rem, Comfortable 1.25rem, Large 1.4375rem. Measure = factor x body size.
const SERIF = "Source Serif 4";
const PX = { standard: 18, comfortable: 20, large: 23 };
const MEASURE = { focused: 32, roomy: 37 };
const LABEL = {
  standard: "Standard",
  comfortable: "Comfortable",
  large: "Large",
  focused: "Focused",
  roomy: "Roomy",
};
const THEME_COUNT = 12;

/** Computed style of the article body text, the thing a reader actually sees. */
const typo = (page) =>
  page.evaluate(() => {
    const p = document.querySelector(".prose-j p");
    const cs = getComputedStyle(p);
    return {
      family: cs.fontFamily.split(",")[0].replace(/["']/g, "").trim(),
      px: parseFloat(cs.fontSize),
      measure: document.querySelector(".prose-j").getBoundingClientRect().width,
    };
  });
const expectTypo = async (page, size, width, msg = "", { measure = true } = {}) => {
  const t = await typo(page);
  assert.equal(t.family, SERIF, `${msg}: the article font is the default serif`);
  assert.equal(t.px, PX[size], `${msg}: body size`);
  // the measure is a maximum: on a phone the column is narrower than either choice, so it is only checked on wide screens
  if (measure)
    assert.ok(
      Math.abs(t.measure - MEASURE[width] * PX[size]) < 1,
      `${msg}: measure ${t.measure}px for ${width}/${size}`,
    );
};

const act = (locator, touch) => (touch ? locator.tap() : locator.click());
const openMenu = async (page, touch = false) => {
  await act(page.getByRole("button", { name: /Appearance/ }), touch);
  await page.locator(".j-appearance").waitFor();
};
const closeMenu = async (page) => {
  await page.keyboard.press("Escape");
  await page.locator(".j-appearance").waitFor({ state: "hidden" });
};
const choose = (page, id, touch = false) =>
  act(
    page.locator(".j-appearance label").filter({ hasText: new RegExp(`^\\s*${LABEL[id]}\\s*$`) }),
    touch,
  );
const stored = (page) => page.evaluate(() => JSON.parse(localStorage.getItem("journal-prefs")));
const legends = (page) =>
  page.evaluate(() =>
    [...document.querySelectorAll(".j-appearance legend")].map((l) => l.textContent.trim()),
  );
const optionLabels = (page) =>
  page.evaluate(() =>
    [...document.querySelectorAll(".j-appearance label")].map((l) => l.textContent.trim()),
  );
const checkedIds = (page) =>
  page.evaluate(() =>
    Object.fromEntries(
      ["theme", "size", "width"].map((n) => [
        n,
        [...document.querySelectorAll(`.j-appearance input[name="${n}"]:checked`)].map(
          (i) => i.value,
        ),
      ]),
    ),
  );

describe("Appearance offers Text size and Article width only on valid article pages (#79)", () => {
  for (const route of ARTICLES)
    it(`${route}: Theme, Text size and Article width; no Article font`, async () => {
      const { ctx, page, problems } = await openPage(env, route);
      await openMenu(page);
      assert.deepEqual(await legends(page), ["Theme", "Text size", "Article width"]);
      const labels = await optionLabels(page);
      for (const gone of ["Serif", "Sans-serif", "Article font"])
        assert.ok(
          !labels.includes(gone) &&
            !(await page.locator(".j-appearance").innerText()).includes(gone),
          `no "${gone}" control`,
        );
      assert.equal(await page.locator('.j-appearance input[name="font"]').count(), 0);
      assert.equal(await page.locator('.j-appearance input[name="theme"]').count(), THEME_COUNT);
      assert.deepEqual(problems(), []);
      await ctx.close();
    });

  const NOT_ARTICLES = [
    ["home", "/weblog/"],
    ["about", "/weblog/about/"],
    ["contact", "/weblog/contact/"],
    ["terms", "/weblog/terms/"],
    ["series", "/weblog/series/api-gateway-101/"],
    ["series", "/weblog/series/blogging-101/"],
    ["tag", "/weblog/tags/api-gateway/"],
    ["tag", "/weblog/tags/kong/"],
    ["tag", "/weblog/tags/github/"],
  ];
  for (const [name, route] of NOT_ARTICLES)
    it(`${name} ${route}: only Theme, all ${THEME_COUNT} themes, neither reading control`, async () => {
      const { ctx, page } = await openPage(env, route);
      await openMenu(page);
      assert.deepEqual(await legends(page), ["Theme"]);
      const text = await page.locator(".j-appearance").innerText();
      for (const gone of ["Text size", "Article width", "Article font", "Focused", "Roomy"])
        assert.ok(!text.includes(gone), `no "${gone}"`);
      assert.equal(await page.locator('.j-appearance input[name="theme"]').count(), THEME_COUNT);
      await ctx.close();
    });

  for (const route of ["/weblog/no-such-page/", "/weblog/2099/01/01/not-an-article.html"])
    it(`${route} (a direct load of an unknown URL) is the bare 404 page: no Appearance menu, so no reading controls`, async () => {
      const { ctx, page } = await openPage(env, route);
      assert.match(await page.locator("body").innerText(), /Page not found/);
      assert.equal(await page.getByRole("button", { name: /Appearance/ }).count(), 0);
      assert.equal(
        await page.locator(".j-appearance, input[name=size], input[name=width]").count(),
        0,
      );
      await ctx.close();
    });

  it("an unknown article-shaped URL reached by client navigation (not-found inside the site shell) offers Theme only", async () => {
    const { ctx, page } = await openPage(env, INTRO);
    await openMenu(page);
    assert.equal((await legends(page)).length, 3, "premise: a real article has the controls");
    await closeMenu(page);
    await page.evaluate(() => {
      history.pushState({}, "", "/weblog/2099/01/01/not-an-article.html");
      window.dispatchEvent(new PopStateEvent("popstate"));
    });
    await page.getByText("This article doesn’t exist.").waitFor();
    await openMenu(page);
    assert.deepEqual(await legends(page), ["Theme"], "a not-found article match is not an article");
    await ctx.close();
  });

  it("a theme chosen on a page without reading controls applies and persists", async () => {
    const { ctx, page } = await openPage(env, "/weblog/");
    await openMenu(page);
    await page
      .locator(".j-appearance label")
      .filter({ hasText: /Batman/ })
      .click();
    assert.equal(await page.evaluate(() => document.documentElement.dataset.theme), "batman");
    assert.equal((await stored(page)).theme, "batman");
    await page.reload({ waitUntil: "networkidle" });
    assert.equal(await page.evaluate(() => document.documentElement.dataset.theme), "batman");
    await ctx.close();
  });

  it("direct entry, then client navigation away from and back to an article, shows the controls exactly there", async () => {
    const { ctx, page, problems } = await openPage(env, INTRO);
    await page.evaluate(() => (window.__spa = "same document"));
    await openMenu(page);
    await choose(page, "large");
    await choose(page, "focused");
    assert.deepEqual(await legends(page), ["Theme", "Text size", "Article width"]);
    await closeMenu(page);
    // away: article -> home (client side)
    await page
      .getByRole("link", { name: /All writing/ })
      .first()
      .click();
    await page.waitForURL(/\/weblog\/$/);
    await openMenu(page);
    assert.deepEqual(await legends(page), ["Theme"], "home: Theme only");
    await closeMenu(page);
    // back: browser Back to the article (client side): the controls are back and show the saved choices
    await page.goBack();
    await page.waitForURL(/introduction-to-api-gateway\.html$/);
    await openMenu(page);
    assert.deepEqual(await legends(page), ["Theme", "Text size", "Article width"]);
    const c = await checkedIds(page);
    assert.deepEqual(
      [c.size, c.width],
      [["large"], ["focused"]],
      "the menu shows the saved choices",
    );
    await expectTypo(page, "large", "focused", "after leaving and returning");
    await closeMenu(page);
    // and again through links: home -> latest article
    await page
      .getByRole("link", { name: /All writing/ })
      .first()
      .click();
    await page.waitForURL(/\/weblog\/$/);
    await page.getByRole("link", { name: /Read the article/ }).click();
    await page.waitForURL(/\.html$/);
    await openMenu(page);
    assert.deepEqual(await legends(page), ["Theme", "Text size", "Article width"]);
    await expectTypo(page, "large", "focused", "another article via links");
    assert.equal(
      await page.evaluate(() => window.__spa),
      "same document",
      "this was client navigation, not reloads",
    );
    assert.deepEqual(problems(), []);
    await ctx.close();
  });

  it("with the menu already open, navigating to a non-article page removes the reading controls", async () => {
    const { ctx, page } = await openPage(env, INTRO);
    await openMenu(page);
    assert.equal((await legends(page)).length, 3);
    // the router changes page while the menu is open (browser Back to the previous entry via history API)
    await page.evaluate(() => {
      history.pushState({}, "", "/weblog/about/");
      window.dispatchEvent(new PopStateEvent("popstate"));
    });
    await page.waitForFunction(
      () => !document.querySelector(".j-appearance legend:nth-of-type(2)"),
    );
    assert.deepEqual(await legends(page), ["Theme"]);
    await ctx.close();
  });
});

describe("computed article typography follows the controls (default serif, fixed)", () => {
  it("every Text size x Article width combination changes the computed body size and measure immediately", async () => {
    const { ctx, page, problems } = await openPage(env, INTRO);
    await expectTypo(page, "comfortable", "roomy", "defaults");
    await openMenu(page);
    for (const width of ["focused", "roomy"])
      for (const size of ["standard", "comfortable", "large"]) {
        await choose(page, size);
        await choose(page, width);
        // no waiting: the very next read must already show the change
        await expectTypo(page, size, width, `${size} / ${width}`);
      }
    assert.deepEqual(problems(), []);
    await ctx.close();
  });

  for (const route of ARTICLES)
    it(`${route}: the default serif at all three sizes`, async () => {
      const { ctx, page } = await openPage(env, route);
      await openMenu(page);
      for (const size of ["standard", "comfortable", "large"]) {
        await choose(page, size);
        const rows = await page.evaluate(() =>
          [...document.querySelectorAll(".prose-j p, .prose-j li, .prose-j blockquote")].map(
            (e) => {
              const cs = getComputedStyle(e);
              return [cs.fontFamily.split(",")[0].replace(/["']/g, ""), cs.fontSize];
            },
          ),
        );
        assert.ok(rows.length >= 3, `${rows.length} text blocks measured`);
        for (const r of rows) assert.deepEqual(r, [SERIF, `${PX[size]}px`], size);
      }
      await ctx.close();
    });

  it("a saved Sans-serif selection from an older version is ignored: the article is serif (with the saved size and width)", async () => {
    const legacy = JSON.stringify({
      theme: "paper",
      font: "sans",
      size: "large",
      width: "focused",
    });
    const early = () =>
      document.addEventListener("DOMContentLoaded", () => {
        const p = document.querySelector(".prose-j p");
        window.__early =
          p && getComputedStyle(p).fontSize + "|" + getComputedStyle(p).fontFamily.split(",")[0];
      });
    const { ctx, page, problems } = await openPage(env, SETUP, {
      init: `(${early})();if(!localStorage.getItem("journal-prefs"))localStorage.setItem("journal-prefs", ${JSON.stringify(legacy)})`,
    });
    await expectTypo(page, "large", "focused", "legacy payload");
    assert.equal(
      await page.evaluate(() => window.__early),
      `23px|"Source Serif 4"`,
      "serif already before React hydrates",
    );
    assert.equal(
      await page.evaluate(() => document.documentElement.hasAttribute("data-font")),
      false,
      "no data-font attribute is applied",
    );
    await openMenu(page);
    assert.deepEqual(await legends(page), ["Theme", "Text size", "Article width"]);
    const c = await checkedIds(page);
    assert.deepEqual([c.theme, c.size, c.width], [["paper"], ["large"], ["focused"]]);
    // the old payload is still stored until the reader changes something; then the font key is dropped, the rest is kept
    assert.equal((await stored(page)).font, "sans");
    await choose(page, "standard");
    assert.deepEqual(await stored(page), { theme: "paper", size: "standard", width: "focused" });
    await expectTypo(page, "standard", "focused", "after changing size");
    // another article, a reload and a direct entry stay serif as well
    await page.reload({ waitUntil: "networkidle" });
    await expectTypo(page, "standard", "focused", "after reload");
    assert.deepEqual(problems(), []);
    await ctx.close();
  });

  it("persists across client navigation, reload and direct entry, already applied before first paint", async () => {
    const early = () =>
      document.addEventListener("DOMContentLoaded", () => {
        const p = document.querySelector(".prose-j p");
        window.__early =
          p && getComputedStyle(p).fontSize + "|" + getComputedStyle(p).fontFamily.split(",")[0];
      });
    const { ctx, page, problems } = await openPage(env, INTRO, { init: early });
    await openMenu(page);
    await choose(page, "large");
    await choose(page, "focused");
    await page.keyboard.press("Escape");
    // client-side navigation (no document reload): article -> home -> latest article
    await page.evaluate(() => (window.__spa = "same document"));
    await page
      .getByRole("link", { name: /All writing/ })
      .first()
      .click();
    await page.waitForURL(/\/weblog\/$/);
    await page.getByRole("link", { name: /Read the article/ }).click();
    await page.waitForURL(/\.html$/);
    assert.equal(
      await page.evaluate(() => window.__spa),
      "same document",
      "this was a client navigation",
    );
    await expectTypo(page, "large", "focused", "after client navigation");
    // reload
    await page.reload({ waitUntil: "networkidle" });
    await expectTypo(page, "large", "focused", "after reload");
    assert.equal(
      await page.evaluate(() => window.__early),
      `23px|"Source Serif 4"`,
      "no flash: the stored choice is on the page before React hydrates",
    );
    // direct entry from a fresh browser context that only carries the stored choice
    const state = await ctx.storageState();
    const fresh = await openPage(env, EXT, { init: early, storageState: state });
    await expectTypo(fresh.page, "large", "focused", "direct entry");
    assert.equal(await fresh.page.evaluate(() => window.__early), `23px|"Source Serif 4"`);
    assert.deepEqual(problems(), []);
    await fresh.ctx.close();
    await ctx.close();
  });

  it("changing size and width keeps the theme, and stores exactly the three choices (no font)", async () => {
    const { ctx, page } = await openPage(env, INTRO);
    await openMenu(page);
    await choose(page, "focused");
    await page
      .locator(".j-appearance label")
      .filter({ hasText: /Batman/ })
      .click();
    await choose(page, "standard");
    assert.deepEqual(await stored(page), { theme: "batman", size: "standard", width: "focused" });
    const h = await page.evaluate(() => ({ ...document.documentElement.dataset }));
    assert.equal(h.theme, "batman");
    assert.equal(h.width, "focused");
    assert.equal(h.size, "standard");
    assert.equal(h.font, undefined, "no data-font");
    await expectTypo(page, "standard", "focused");
    await ctx.close();
  });
});

describe("the selection is visible, on a mouse and on a touch screen", () => {
  for (const touch of [false, true]) {
    it(`${touch ? "touch (tapping)" : "mouse (clicking)"}: the chosen option looks chosen, the others do not`, async () => {
      const { ctx, page } = await openPage(env, INTRO, {
        touch,
        width: touch ? 390 : 1440,
        height: 844,
      });
      if (touch)
        assert.equal(
          await page.evaluate(() => matchMedia("(hover: hover)").matches),
          false,
          "premise: a touch device has no hover",
        );
      await openMenu(page, touch);
      await choose(page, "large", touch);
      await choose(page, "focused", touch);
      const groups = await page.evaluate(() =>
        ["size", "width"].map((n) => {
          const labels = [...document.querySelectorAll(`.j-appearance input[name="${n}"]`)].map(
            (i) => {
              const l = i.closest("label"),
                cs = getComputedStyle(l),
                r = i.getBoundingClientRect();
              return {
                checked: i.checked,
                bg: cs.backgroundColor,
                border: cs.borderColor,
                radioVisible:
                  r.width >= 12 && r.height >= 12 && getComputedStyle(i).opacity === "1",
              };
            },
          );
          return { n, labels };
        }),
      );
      for (const { n, labels } of groups) {
        const on = labels.filter((l) => l.checked),
          off = labels.filter((l) => !l.checked);
        assert.equal(on.length, 1, `${n}: exactly one option is selected`);
        assert.ok(
          labels.every((l) => l.radioVisible),
          `${n}: every option shows its radio`,
        );
        assert.notEqual(on[0].bg, off[0].bg, `${n}: selected background differs`);
        assert.notEqual(on[0].border, off[0].border, `${n}: selected border differs`);
        // nothing else is highlighted (no stuck hover state on the last-tapped option)
        assert.equal(
          new Set(off.map((l) => l.bg + l.border)).size,
          1,
          `${n}: unselected options look alike`,
        );
      }
      await ctx.close();
    });
  }

  it("the selected option's text and border stay readable in every theme (4.5:1 text, 3:1 border)", async () => {
    const ids = [
      "original",
      "paper",
      "sepia",
      "dark-modern",
      "solarized-light",
      "solarized-dark",
      "space",
      "spiderman",
      "batman",
      "superman",
      "ironman",
    ];
    const { ctx, page } = await openPage(env, INTRO);
    for (const id of ids) {
      await page.evaluate(
        (t) =>
          localStorage.setItem(
            "journal-prefs",
            JSON.stringify({ theme: t, size: "large", width: "roomy" }),
          ),
        id,
      );
      await page.reload({ waitUntil: "networkidle" });
      await openMenu(page);
      const r = await page.evaluate(() => {
        const toRgb = (css) => {
          const c = document.createElement("canvas").getContext("2d");
          c.fillStyle = "#000";
          c.fillStyle = css;
          c.fillRect(0, 0, 1, 1);
          const d = c.getImageData(0, 0, 1, 1).data;
          return [d[0], d[1], d[2]];
        };
        const lum = ([r, g, b]) => 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
        const f = (v) => ((v /= 255) <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
        const ratio = (a, b) => {
          const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
          return (x + 0.05) / (y + 0.05);
        };
        const label = document
          .querySelector('.j-appearance input[name="size"]:checked')
          .closest("label");
        const cs = getComputedStyle(label);
        const panel = toRgb(
          getComputedStyle(document.querySelector(".j-appearance")).backgroundColor,
        );
        return {
          text: +ratio(toRgb(cs.color), toRgb(cs.backgroundColor)).toFixed(2),
          border: +ratio(toRgb(cs.borderTopColor), panel).toFixed(2),
        };
      });
      assert.ok(r.text >= 4.5, `${id}: selected text ${r.text}:1`);
      assert.ok(r.border >= 3, `${id}: selected border ${r.border}:1 against the panel`);
      await page.keyboard.press("Escape");
    }
    await ctx.close();
  });
});

describe("keyboard operation", () => {
  it("open, arrow within a group, Tab to the next group, visible focus ring, Escape returns focus", async () => {
    const { ctx, page } = await openPage(env, INTRO);
    const trigger = page.getByRole("button", { name: /Appearance/ });
    await trigger.focus();
    await page.keyboard.press("Enter");
    await page.locator(".j-appearance").waitFor();
    await page.locator('.j-appearance input[name="theme"]:checked').focus();
    await page.keyboard.press("Tab");
    assert.equal(
      await page.evaluate(() => document.activeElement.name),
      "size",
      "Tab moves from Theme to Text size (the font group is gone)",
    );
    await page.keyboard.press("ArrowRight");
    await expectTypo(page, "large", "roomy", "ArrowRight in Text size");
    await page.keyboard.press("ArrowLeft");
    await page.keyboard.press("ArrowLeft");
    await expectTypo(page, "standard", "roomy", "ArrowLeft twice");
    await page.keyboard.press("Tab");
    assert.equal(await page.evaluate(() => document.activeElement.name), "width");
    await page.keyboard.press("ArrowLeft");
    await expectTypo(page, "standard", "focused", "ArrowLeft in Article width");
    const ring = await page.evaluate(() => {
      const cs = getComputedStyle(document.activeElement.closest("label"));
      return { style: cs.outlineStyle, width: parseFloat(cs.outlineWidth) };
    });
    assert.notEqual(ring.style, "none", "the focused option has an outline");
    assert.ok(ring.width >= 2, `outline ${ring.width}px`);
    await page.keyboard.press("Escape");
    await page.locator(".j-appearance").waitFor({ state: "hidden" });
    assert.equal(
      await trigger.evaluate((e) => e === document.activeElement),
      true,
      "focus returns to the trigger",
    );
    await expectTypo(page, "standard", "focused", "choices survive closing the menu");
    await ctx.close();
  });
});

describe("the Appearance panel on short phone viewports", () => {
  for (const [w, h] of [
    [320, 568],
    [390, 500],
    [667, 375],
  ]) {
    it(`${w}x${h}: fits the viewport, scrolls, and every group is reachable by touch and by keyboard`, async () => {
      const { ctx, page, problems } = await openPage(env, INTRO, {
        touch: true,
        width: w,
        height: h,
      });
      await openMenu(page, true);
      const box = await page.evaluate(() => {
        const el = document.querySelector(".j-appearance"),
          r = el.getBoundingClientRect();
        return {
          top: r.top,
          bottom: r.bottom,
          left: r.left,
          right: r.right,
          vh: innerHeight,
          vw: innerWidth,
          overflowY: getComputedStyle(el).overflowY,
          scrolls: el.scrollHeight > el.clientHeight,
        };
      });
      assert.ok(
        box.top >= 0 && box.bottom <= box.vh + 0.5,
        `panel ${box.top}..${box.bottom} within ${box.vh}`,
      );
      assert.ok(box.left >= 0 && box.right <= box.vw + 0.5, "panel within the width");
      assert.match(box.overflowY, /auto|scroll/);
      // keyboard: Tab through to the last group; the browser must keep the focused option visible
      await page.locator('.j-appearance input[name="theme"]:checked').focus();
      for (let i = 0; i < 2; i++) await page.keyboard.press("Tab");
      const last = await page.evaluate(() => {
        const a = document.activeElement,
          r = a.closest("label").getBoundingClientRect(),
          p = document.querySelector(".j-appearance").getBoundingClientRect();
        return {
          name: a.name,
          visible:
            r.top >= p.top - 1 &&
            r.bottom <= p.bottom + 1 &&
            r.top >= 0 &&
            r.bottom <= innerHeight + 1,
        };
      });
      assert.equal(last.name, "width", "keyboard reached the last group");
      assert.ok(last.visible, "the focused option is scrolled into view");
      // touch: the lowest groups can be tapped (Playwright scrolls the panel as a finger would) and change the article
      await choose(page, "large", true);
      await choose(page, "focused", true);
      await expectTypo(page, "large", "focused", "", { measure: false });
      assert.equal(
        await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
        true,
        "no horizontal page overflow",
      );
      assert.deepEqual(problems(), []);
      await ctx.close();
    });
  }
});

describe("stored preference compatibility and storage fallbacks", () => {
  const seed = (value) => `localStorage.setItem("journal-prefs", ${JSON.stringify(value)})`;
  const cases = [
    [
      "a partial older value (only the retired font) is ignored and the rest defaults",
      JSON.stringify({ font: "sans" }),
      "comfortable",
      "roomy",
    ],
    [
      "unknown extra keys are ignored",
      JSON.stringify({ size: "large", legacy: true }),
      "large",
      "roomy",
    ],
    [
      "every valid size and width is honoured, and a stored font changes nothing",
      JSON.stringify({ theme: "paper", font: "sans", size: "standard", width: "focused" }),
      "standard",
      "focused",
    ],
    [
      "unknown values fall back to the defaults",
      JSON.stringify({ font: "cursive", size: "huge", width: "wide", theme: "nope" }),
      "comfortable",
      "roomy",
    ],
    ["malformed JSON falls back to the defaults", "{not json", "comfortable", "roomy"],
  ];
  for (const [name, value, size, width] of cases)
    it(name, async () => {
      const { ctx, page, problems } = await openPage(env, INTRO, { init: seed(value) });
      await expectTypo(page, size, width);
      await openMenu(page);
      const c = await checkedIds(page);
      for (const [group, ids] of Object.entries(c))
        assert.equal(ids.length, 1, `${group}: exactly one selected (${ids})`);
      assert.deepEqual(
        [c.size[0], c.width[0]],
        [size, width],
        "the menu shows what the page shows",
      );
      assert.deepEqual(problems(), []);
      await ctx.close();
    });

  it("when the browser refuses to save, the choice still applies and survives client navigation, with a notice", async () => {
    const { ctx, page, problems } = await openPage(env, INTRO, {
      init: () => {
        Storage.prototype.setItem = () => {
          throw new Error("blocked");
        };
      },
    });
    await openMenu(page);
    await choose(page, "large");
    await expectTypo(page, "large", "roomy");
    assert.match(await page.locator(".j-appearance").innerText(), /isn’t saving preferences/);
    await page.keyboard.press("Escape");
    await page
      .getByRole("link", { name: /All writing/ })
      .first()
      .click();
    await page.waitForURL(/\/weblog\/$/);
    await page.getByRole("link", { name: /Read the article/ }).click();
    await page.waitForURL(/\.html$/);
    await expectTypo(page, "large", "roomy", "still applied after client navigation");
    await page.reload({ waitUntil: "networkidle" });
    await expectTypo(
      page,
      "comfortable",
      "roomy",
      "nothing was saved, so a reload starts from the defaults",
    );
    assert.deepEqual(problems(), []);
    await ctx.close();
  });

  it("when storage cannot even be read (access throws), the page loads cleanly and the controls still work", async () => {
    const { ctx, page, problems } = await openPage(env, INTRO, {
      init: () =>
        Object.defineProperty(window, "localStorage", {
          get() {
            throw new DOMException("denied", "SecurityError");
          },
        }),
    });
    await expectTypo(page, "comfortable", "roomy");
    await openMenu(page);
    await choose(page, "standard");
    await choose(page, "focused");
    await expectTypo(page, "standard", "focused");
    assert.deepEqual(problems(), []);
    await ctx.close();
  });
});
