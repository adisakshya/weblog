// Reading controls (#75) against the BUILT static site under /weblog/: the Appearance menu must change what the reader
// actually sees (computed article body font and size), update immediately, persist, show the selection, work from the
// keyboard and on a short phone viewport, and keep stored-preference compatibility and the blocked-storage fallback.
import { after, before, describe, it } from "node:test";
import assert from "node:assert/strict";
import { EXT, INTRO, SETUP, openPage, start } from "./helpers.mjs";

let env;
before(async () => {
  env = await start();
});
after(async () => {
  await env.stop();
});

// Default root font size (16px): Standard 1.125rem, Comfortable 1.25rem, Large 1.4375rem.
const FAMILY = { serif: "Source Serif 4", sans: "IBM Plex Sans" };
const PX = { standard: 18, comfortable: 20, large: 23 };
const LABEL = {
  serif: "Serif",
  sans: "Sans-serif",
  standard: "Standard",
  comfortable: "Comfortable",
  large: "Large",
  focused: "Focused",
  roomy: "Roomy",
};

/** Computed style of the article body text, the thing a reader actually sees. */
const typo = (page) =>
  page.evaluate(() => {
    const p = document.querySelector(".prose-j p");
    const cs = getComputedStyle(p);
    return {
      family: cs.fontFamily.split(",")[0].replace(/["']/g, "").trim(),
      px: parseFloat(cs.fontSize),
    };
  });
const expectTypo = async (page, font, size, msg = "") =>
  assert.deepEqual(await typo(page), { family: FAMILY[font], px: PX[size] }, msg);

const act = (locator, touch) => (touch ? locator.tap() : locator.click());
const openMenu = async (page, touch = false) => {
  await act(page.getByRole("button", { name: /Appearance/ }), touch);
  await page.locator(".j-appearance").waitFor();
};
const choose = (page, id, touch = false) =>
  act(
    page.locator(".j-appearance label").filter({ hasText: new RegExp(`^\\s*${LABEL[id]}\\s*$`) }),
    touch,
  );
const stored = (page) => page.evaluate(() => JSON.parse(localStorage.getItem("journal-prefs")));
const checkedIds = (page) =>
  page.evaluate(() =>
    Object.fromEntries(
      ["theme", "font", "size", "width"].map((n) => [
        n,
        [...document.querySelectorAll(`.j-appearance input[name="${n}"]:checked`)].map(
          (i) => i.value,
        ),
      ]),
    ),
  );

describe("computed article typography follows the controls", () => {
  it("every Serif/Sans-serif x Standard/Comfortable/Large combination changes the computed body font and size immediately", async () => {
    const { ctx, page, problems } = await openPage(env, INTRO);
    await expectTypo(page, "serif", "comfortable", "defaults");
    await openMenu(page);
    for (const font of ["sans", "serif"])
      for (const size of ["standard", "comfortable", "large"]) {
        await choose(page, font);
        await choose(page, size);
        // no waiting: the very next read must already show the change
        await expectTypo(page, font, size, `${font} / ${size}`);
      }
    assert.deepEqual(problems(), []);
    await ctx.close();
  });

  it("applies to the whole article body, not only the first paragraph", async () => {
    const { ctx, page } = await openPage(env, SETUP);
    await openMenu(page);
    await choose(page, "sans");
    await choose(page, "large");
    const rows = await page.evaluate(() =>
      [...document.querySelectorAll(".prose-j p, .prose-j li, .prose-j blockquote")].map((e) => {
        const cs = getComputedStyle(e);
        return [cs.fontFamily.split(",")[0].replace(/["']/g, ""), cs.fontSize];
      }),
    );
    assert.ok(rows.length >= 10, `${rows.length} text blocks measured`);
    for (const r of rows) assert.deepEqual(r, ["IBM Plex Sans", "23px"]);
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
    await choose(page, "sans");
    await choose(page, "large");
    await page.keyboard.press("Escape");
    // client-side navigation (no document reload): article -> home -> latest article
    await page.evaluate(() => (window.__spa = "same document"));
    await page
      .getByRole("link", { name: /All writing/ })
      .first()
      .click();
    await page.waitForURL(/\/weblog\/$/);
    await page.getByRole("link", { name: /Read the article/ }).click();
    await page.waitForURL(/ateway-for-your-microservices\.html$|\.html$/);
    assert.equal(
      await page.evaluate(() => window.__spa),
      "same document",
      "this was a client navigation",
    );
    await expectTypo(page, "sans", "large", "after client navigation");
    // reload
    await page.reload({ waitUntil: "networkidle" });
    await expectTypo(page, "sans", "large", "after reload");
    assert.equal(
      await page.evaluate(() => window.__early),
      `23px|"IBM Plex Sans"`,
      "no flash: the stored choice is on the page before React hydrates",
    );
    // direct entry from a fresh browser context that only carries the stored choice
    const state = await ctx.storageState();
    const fresh = await openPage(env, EXT, { init: early, storageState: state });
    await expectTypo(fresh.page, "sans", "large", "direct entry");
    assert.equal(await fresh.page.evaluate(() => window.__early), `23px|"IBM Plex Sans"`);
    assert.deepEqual(problems(), []);
    await fresh.ctx.close();
    await ctx.close();
  });

  it("changing font and size keeps the theme and width, and stores all four choices", async () => {
    const { ctx, page } = await openPage(env, INTRO);
    await openMenu(page);
    await choose(page, "focused");
    await page
      .locator(".j-appearance label")
      .filter({ hasText: /Batman/ })
      .click();
    await choose(page, "sans");
    await choose(page, "standard");
    assert.deepEqual(await stored(page), {
      theme: "batman",
      font: "sans",
      size: "standard",
      width: "focused",
    });
    const h = await page.evaluate(() => ({ ...document.documentElement.dataset }));
    assert.equal(h.theme, "batman");
    assert.equal(h.width, "focused");
    await expectTypo(page, "sans", "standard");
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
      await choose(page, "sans", touch);
      await choose(page, "large", touch);
      await choose(page, "focused", touch);
      const groups = await page.evaluate(() =>
        ["font", "size", "width"].map((n) => {
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
            JSON.stringify({ theme: t, font: "sans", size: "large", width: "roomy" }),
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
    await page.locator('.j-appearance input[name="font"]:checked').focus();
    await page.keyboard.press("ArrowRight");
    await expectTypo(page, "sans", "comfortable", "ArrowRight in Article font");
    await page.keyboard.press("Tab");
    assert.equal(
      await page.evaluate(() => document.activeElement.name),
      "size",
      "Tab moves to the next group",
    );
    await page.keyboard.press("ArrowRight");
    await expectTypo(page, "sans", "large", "ArrowRight in Text size");
    await page.keyboard.press("ArrowLeft");
    await page.keyboard.press("ArrowLeft");
    await expectTypo(page, "sans", "standard", "ArrowLeft twice");
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
    await expectTypo(page, "sans", "standard", "choices survive closing the menu");
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
      for (let i = 0; i < 3; i++) await page.keyboard.press("Tab");
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
      await choose(page, "sans", true);
      await choose(page, "large", true);
      await choose(page, "focused", true);
      await expectTypo(page, "sans", "large");
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
      "a partial older value keeps what it has and defaults the rest",
      JSON.stringify({ font: "sans" }),
      "sans",
      "comfortable",
    ],
    [
      "unknown extra keys are ignored",
      JSON.stringify({ size: "large", legacy: true }),
      "serif",
      "large",
    ],
    [
      "every valid combination is honoured",
      JSON.stringify({ theme: "paper", font: "sans", size: "standard", width: "focused" }),
      "sans",
      "standard",
    ],
    [
      "unknown values fall back to the defaults",
      JSON.stringify({ font: "cursive", size: "huge", width: "wide", theme: "nope" }),
      "serif",
      "comfortable",
    ],
    ["malformed JSON falls back to the defaults", "{not json", "serif", "comfortable"],
  ];
  for (const [name, value, font, size] of cases)
    it(name, async () => {
      const { ctx, page, problems } = await openPage(env, INTRO, { init: seed(value) });
      await expectTypo(page, font, size);
      await openMenu(page);
      const c = await checkedIds(page);
      for (const [group, ids] of Object.entries(c))
        assert.equal(ids.length, 1, `${group}: exactly one selected (${ids})`);
      assert.deepEqual([c.font[0], c.size[0]], [font, size], "the menu shows what the page shows");
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
    await choose(page, "sans");
    await choose(page, "large");
    await expectTypo(page, "sans", "large");
    assert.match(await page.locator(".j-appearance").innerText(), /isn’t saving preferences/);
    await page.keyboard.press("Escape");
    await page
      .getByRole("link", { name: /All writing/ })
      .first()
      .click();
    await page.waitForURL(/\/weblog\/$/);
    await page.getByRole("link", { name: /Read the article/ }).click();
    await page.waitForURL(/\.html$/);
    await expectTypo(page, "sans", "large", "still applied after client navigation");
    await page.reload({ waitUntil: "networkidle" });
    await expectTypo(
      page,
      "serif",
      "comfortable",
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
    await expectTypo(page, "serif", "comfortable");
    await openMenu(page);
    await choose(page, "sans");
    await choose(page, "standard");
    await expectTypo(page, "sans", "standard");
    assert.deepEqual(problems(), []);
    await ctx.close();
  });
});
