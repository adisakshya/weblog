// Keyboard access, accessible names, document structure, and responsive overflow on every route.
import { after, before, describe, it } from "node:test";
import assert from "node:assert/strict";
import { ARTICLES, ROUTES, openPage, start } from "./helpers.mjs";

let env;
before(async () => {
  env = await start();
});
after(async () => {
  await env.stop();
});

describe("keyboard", () => {
  it("first Tab stop is the skip link; activating it moves the next Tab into <main>", async () => {
    const { ctx, page } = await openPage(env, "/weblog/");
    await page.keyboard.press("Tab");
    assert.equal(
      await page.evaluate(() => document.activeElement.textContent.trim()),
      "Skip to content",
    );
    await page.keyboard.press("Enter");
    await page.keyboard.press("Tab");
    assert.equal(
      await page.evaluate(() => !!document.activeElement.closest("main")),
      true,
      "focus continues inside main, not back in the header",
    );
    await ctx.close();
  });

  it("header controls are reachable in a sensible order and show a visible focus indicator", async () => {
    const { ctx, page } = await openPage(env, "/weblog/");
    const seen = [];
    for (let i = 0; i < 6; i++) {
      await page.keyboard.press("Tab");
      seen.push(
        await page.evaluate(() => {
          const e = document.activeElement;
          const s = getComputedStyle(e);
          const visible =
            (s.outlineStyle !== "none" && parseFloat(s.outlineWidth) > 0) || s.boxShadow !== "none";
          return {
            text: (e.getAttribute("aria-label") || e.textContent).trim().slice(0, 30),
            visible,
          };
        }),
      );
    }
    const names = seen.map((s) => s.text);
    assert.match(names[0], /Skip to content/);
    assert.match(names[1], /^Adisakshya Chauhan$/);
    assert.match(names[2], /Meet Adi/);
    assert.match(names[3], /Search/);
    assert.match(names[4], /Appearance/);
    for (const s of seen)
      assert.equal(s.visible, true, `no visible focus indicator on "${s.text}"`);
    await ctx.close();
  });

  it("long code blocks and tables are keyboard-scrollable (focusable)", async () => {
    const { ctx, page } = await openPage(env, ARTICLES[0]);
    const bad = await page.evaluate(
      () =>
        [...document.querySelectorAll(".code-block pre, .table-wrap")].filter((e) => e.tabIndex < 0)
          .length,
    );
    assert.equal(bad, 0);
    await ctx.close();
  });
});

describe("structure and names (every route)", () => {
  for (const route of [...ROUTES, "/weblog/not-found-route/"]) {
    it(`${route}`, async () => {
      const { ctx, page } = await openPage(env, null);
      await page.goto(env.base + route, { waitUntil: "networkidle" });
      const r = await page.evaluate(() => {
        const name = (e) =>
          (
            e.getAttribute("aria-label") ||
            e.getAttribute("aria-labelledby") ||
            e.textContent ||
            e.getAttribute("title") ||
            (e.labels && e.labels[0] && e.labels[0].textContent) ||
            ""
          ).trim();
        const unnamed = [
          ...document.querySelectorAll("a[href],button,input,select,textarea,[role=button]"),
        ]
          .filter((e) => !name(e))
          .map((e) => e.outerHTML.slice(0, 90));
        const noAlt = [...document.querySelectorAll("img")]
          .filter((e) => e.getAttribute("alt") === null)
          .map((e) => e.src);
        const levels = [...document.querySelectorAll("h1,h2,h3,h4,h5,h6")].map(
          (h) => +h.tagName[1],
        );
        const skips = levels.filter((l, i) => i > 0 && l - levels[i - 1] > 1);
        const ids = [...document.querySelectorAll("[id]")].map((e) => e.id);
        return {
          lang: document.documentElement.lang,
          title: document.title,
          h1: levels.filter((l) => l === 1).length,
          unnamed,
          noAlt,
          skips,
          dupIds: ids.filter((id, i) => ids.indexOf(id) !== i),
          landmarks: ["main", "header", "footer"].filter((t) => document.querySelector(t)),
        };
      });
      assert.equal(r.lang, "en");
      assert.ok(r.title.length > 3, "has a title");
      assert.equal(r.h1, 1, "exactly one h1");
      assert.deepEqual(r.unnamed, [], "controls need accessible names");
      assert.deepEqual(r.noAlt, [], "images need an alt attribute");
      assert.deepEqual(r.skips, [], "heading levels do not skip");
      assert.deepEqual(r.dupIds, [], "ids are unique");
      if (!route.includes("not-found")) assert.deepEqual(r.landmarks, ["main", "header", "footer"]);
      await ctx.close();
    });
  }
});

describe("responsive layout: no horizontal overflow", () => {
  for (const width of [320, 390, 768, 1024, 1440]) {
    it(`${width}px wide, every route`, async () => {
      const { ctx, page } = await openPage(env, null, { width, height: 900 });
      for (const route of ROUTES) {
        await page.goto(env.base + route, { waitUntil: "networkidle" });
        const over = await page.evaluate(() => ({
          sw: document.documentElement.scrollWidth,
          cw: document.documentElement.clientWidth,
          wide: [...document.querySelectorAll("body *")]
            .filter(
              (e) =>
                e.getBoundingClientRect().right > document.documentElement.clientWidth + 1 &&
                !e.closest(".code-block,.table-wrap,.sr-only"),
            )
            .slice(0, 3)
            .map((e) => e.tagName + "." + e.className),
        }));
        assert.ok(
          over.sw <= over.cw + 1,
          `${route} @${width}: page scrolls horizontally (${over.sw} > ${over.cw}); offenders ${over.wide}`,
        );
        assert.deepEqual(over.wide, [], `${route} @${width}: content outside the viewport`);
      }
      await ctx.close();
    });
  }
});
