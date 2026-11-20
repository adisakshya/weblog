// Appearance: 12 themes, persistence (no flash of the wrong theme), system theme, keyboard use, blocked storage, contrast.
import { after, before, describe, it } from "node:test";
import assert from "node:assert/strict";
import { INTRO, SETUP, openPage, start } from "./helpers.mjs";

let env;
before(async () => {
  env = await start();
});
after(async () => {
  await env.stop();
});

const THEMES = {
  Daylight: "original",
  System: "system",
  Parchment: "paper",
  Amber: "sepia",
  Graphite: "dark-modern",
  Dune: "solarized-light",
  "Deep Sea": "solarized-dark",
  Cosmos: "space",
  "Spider-Man": "spiderman",
  Batman: "batman",
  Superman: "superman",
  "Iron Man": "ironman",
};
const open = async (page) => {
  await page.getByRole("button", { name: /Appearance/ }).click();
  await page.getByRole("dialog").or(page.locator(".j-appearance")).first().waitFor();
};
const attr = (page, name) => page.evaluate((n) => document.documentElement.getAttribute(n), name);

describe("appearance", () => {
  it("offers exactly the 12 approved themes and applies each one", async () => {
    const { ctx, page, problems } = await openPage(env, INTRO);
    await open(page);
    const labels = await page
      .locator('.j-appearance input[name="theme"]')
      .evaluateAll((els) => els.map((e) => e.parentElement.textContent.trim()));
    assert.deepEqual(labels.sort(), Object.keys(THEMES).sort());
    for (const [label, id] of Object.entries(THEMES)) {
      await page
        .locator(".j-appearance label")
        .filter({ hasText: new RegExp(`^\\s*${label}\\s*$`) })
        .click();
      assert.equal(await attr(page, "data-theme-choice"), id, label);
      if (id !== "system") assert.equal(await attr(page, "data-theme"), id, label);
    }
    assert.deepEqual(problems(), []);
    await ctx.close();
  });

  it("persists the choice across reload and client navigation, already applied before first paint", async () => {
    const { ctx, page } = await openPage(env, INTRO);
    await open(page);
    await page
      .locator(".j-appearance label")
      .filter({ hasText: /Batman/ })
      .click();
    await page
      .locator(".j-appearance label")
      .filter({ hasText: /Sans-serif/ })
      .click();
    await page
      .locator(".j-appearance label")
      .filter({ hasText: /^\s*Large\s*$/ })
      .click();
    await page
      .locator(".j-appearance label")
      .filter({ hasText: /Focused/ })
      .click();
    const stored = JSON.parse(await page.evaluate(() => localStorage.getItem("journal-prefs")));
    assert.deepEqual(stored, { theme: "batman", font: "sans", size: "large", width: "focused" });
    // reload: record the attribute at DOMContentLoaded (before React hydrates) in the fresh document
    await ctx.addInitScript(() =>
      document.addEventListener(
        "DOMContentLoaded",
        () => (window.__early = document.documentElement.getAttribute("data-theme")),
      ),
    );
    await page.reload({ waitUntil: "networkidle" });
    assert.equal(
      await page.evaluate(() => window.__early),
      "batman",
      "no flash: theme is set by the inline boot script",
    );
    assert.deepEqual(
      [
        await attr(page, "data-font"),
        await attr(page, "data-size"),
        await attr(page, "data-width"),
      ],
      ["sans", "large", "focused"],
    );
    await page.keyboard.press("Escape");
    await page.goto(env.base + SETUP, { waitUntil: "networkidle" });
    assert.equal(await attr(page, "data-theme"), "batman");
    await ctx.close();
  });

  it("System follows the OS colour scheme, including live changes", async () => {
    const { ctx, page } = await openPage(env, INTRO, { colorScheme: "light" });
    await open(page);
    await page
      .locator(".j-appearance label")
      .filter({ hasText: /^\s*System\s*$/ })
      .click();
    assert.equal(await attr(page, "data-theme"), "original");
    await page.emulateMedia({ colorScheme: "dark" });
    await page.waitForFunction(
      () => document.documentElement.getAttribute("data-theme") === "dark-modern",
    );
    await page.emulateMedia({ colorScheme: "light" });
    await page.waitForFunction(
      () => document.documentElement.getAttribute("data-theme") === "original",
    );
    await ctx.close();
  });

  it("is fully keyboard operable: open, arrow through radios, Escape closes and returns focus", async () => {
    const { ctx, page } = await openPage(env, INTRO);
    const trigger = page.getByRole("button", { name: /Appearance/ });
    await trigger.focus();
    await page.keyboard.press("Enter");
    await page.locator(".j-appearance").waitFor();
    const radio = page.locator('.j-appearance input[name="theme"]').first();
    await radio.focus();
    await page.keyboard.press("ArrowDown");
    assert.notEqual(
      await attr(page, "data-theme-choice"),
      "original",
      "arrow key changed the theme",
    );
    await page.keyboard.press("Escape");
    await page.locator(".j-appearance").waitFor({ state: "hidden" });
    assert.equal(await trigger.evaluate((e) => e === document.activeElement), true);
    await ctx.close();
  });

  it("still applies a choice and says so when the browser blocks storage", async () => {
    const { ctx, page } = await openPage(env, INTRO, {
      init: () => {
        Storage.prototype.setItem = () => {
          throw new Error("blocked");
        };
      },
    });
    await open(page);
    await page
      .locator(".j-appearance label")
      .filter({ hasText: /Cosmos/ })
      .click();
    assert.equal(await attr(page, "data-theme"), "space");
    assert.match(await page.locator(".j-appearance").innerText(), /isn’t saving preferences/);
    await ctx.close();
  });
});

describe("contrast (WCAG AA 4.5:1) in every theme", () => {
  const measure = () => {
    const toRgb = (css) => {
      const c = document.createElement("canvas").getContext("2d");
      c.fillStyle = "#000";
      c.fillStyle = css;
      c.fillRect(0, 0, 1, 1);
      const d = c.getImageData(0, 0, 1, 1).data;
      return [d[0], d[1], d[2], d[3] / 255];
    };
    const lum = ([r, g, b]) => {
      const f = (v) => {
        v /= 255;
        return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
      };
      return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
    };
    const bgOf = (el) => {
      for (let e = el; e; e = e.parentElement) {
        const c = toRgb(getComputedStyle(e).backgroundColor);
        if (c[3] > 0.99) return c;
      }
      return toRgb("#fff");
    };
    const ratio = (fg, bg) => {
      const [a, b] = [lum(fg), lum(bg)].sort((x, y) => y - x);
      return (a + 0.05) / (b + 0.05);
    };
    const out = {};
    const probe = (name, el) => {
      if (!el) return;
      out[name] = +ratio(toRgb(getComputedStyle(el).color), bgOf(el)).toFixed(2);
    };
    probe("body text", document.querySelector(".prose-j p"));
    probe("heading", document.querySelector("h1"));
    probe("muted text", document.querySelector(".j-muted"));
    probe("link", document.querySelector(".prose-j a:not(.heading-anchor)"));
    probe("inline code", document.querySelector(".prose-j p code"));
    probe("code block", document.querySelector(".code-block code"));
    probe("tag chip", document.querySelector(".j-chip"));
    probe("masthead", document.querySelector(".j-masthead"));
    probe("footer link", document.querySelector("footer a"));
    // header actions and footer (#74, #76): primary button, secondary tools, quiet bottom row, grouped links, headings
    probe("Meet Adi button", document.querySelector(".j-meet"));
    probe("Search tool", document.querySelector(".j-header-tool"));
    probe("Follow Adi heading", document.querySelector("#follow-adi"));
    probe("LinkedIn button", document.querySelector(".j-social-links a:nth-child(1)"));
    probe("Twitter/X button", document.querySelector(".j-social-links a:nth-child(2)"));
    probe("GitHub button", document.querySelector(".j-social-links a:nth-child(3)"));
    probe("footer group heading", document.querySelector(".j-footer-groups h2"));
    probe("footer group link", document.querySelector(".j-footer-groups a"));
    probe("footer credit", document.querySelector(".j-footer-bottom p"));
    probe("View source link", document.querySelector(".j-footer-bottom a"));
    for (const t of ["keyword", "string", "comment", "number", "built_in", "attr"])
      probe(`syntax ${t}`, document.querySelector(`.hljs-${t.replace("_", "-")}`));
    return out;
  };
  for (const id of Object.values(THEMES).filter((t) => t !== "system")) {
    it(`${id}: reading surfaces, links, code and syntax colours are >= 4.5:1`, async () => {
      const { ctx, page } = await openPage(env, null, {
        init: `localStorage.setItem("journal-prefs", JSON.stringify({theme:"${id}",font:"serif",size:"comfortable",width:"roomy"}))`,
      });
      await page.goto(env.base + SETUP, { waitUntil: "networkidle" });
      const r = await page.evaluate(measure);
      assert.ok(Object.keys(r).length >= 8, `measured ${Object.keys(r).length} surfaces`);
      // a probe skips a missing element silently, so require the header/footer surfaces to have been measured
      for (const k of [
        "Meet Adi button",
        "Search tool",
        "Follow Adi heading",
        "LinkedIn button",
        "Twitter/X button",
        "GitHub button",
        "footer group heading",
        "footer group link",
        "footer credit",
        "View source link",
      ])
        assert.ok(k in r, `${id}: ${k} was measured`);
      const low = Object.entries(r).filter(([, v]) => v < 4.5);
      assert.deepEqual(low, [], `${id}: ${JSON.stringify(r)}`);
      await ctx.close();
    });
  }
});
