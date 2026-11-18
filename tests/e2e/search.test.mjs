// Search dialog: keyboard shortcut, results from full article text, navigation, focus handling, mobile.
import { after, before, describe, it } from "node:test";
import assert from "node:assert/strict";
import { SETUP, openPage, start } from "./helpers.mjs";

let env;
before(async () => {
  env = await start();
});
after(async () => {
  await env.stop();
});

const results = (page) => page.locator('[role="listbox"] [role="option"]');
// Suggestions are shown for an empty query, so "an option exists" does not mean the typed query was processed:
// wait for the live "N results" status that only appears once real results are rendered.
const typed = async (page, query) => {
  await page.keyboard.type(query, { delay: 15 });
  await page
    .getByRole("dialog")
    .getByText(/^\d+ results?$/)
    .waitFor();
};

describe("search", () => {
  it("opens with / (not while typing), shows suggestions, and Escape closes it returning focus to the trigger", async () => {
    const { ctx, page, problems } = await openPage(env, "/weblog/");
    await page.keyboard.press("/");
    const dialog = page.getByRole("dialog");
    await dialog.waitFor();
    assert.equal(
      await page.locator('input[role="combobox"]').evaluate((e) => e === document.activeElement),
      true,
    );
    assert.match(await dialog.innerText(), /All writing[\s\S]*API Gateway 101/);
    await page.keyboard.type("a/b");
    assert.equal(
      await page.locator('input[role="combobox"]').inputValue(),
      "a/b",
      "typing / inside the field must not be swallowed",
    );
    await page.keyboard.press("Escape");
    await dialog.waitFor({ state: "hidden" });
    // Radix restores focus to the trigger just after unmount: wait for it instead of sampling the instant the dialog hides
    await page.waitForFunction(
      () => {
        const t = [...document.querySelectorAll("button")].find((b) =>
          /^Search/.test(b.getAttribute("aria-label") ?? b.textContent ?? ""),
        );
        return !!t && t === document.activeElement;
      },
      undefined,
      { timeout: 5000 },
    );
    assert.deepEqual(problems(), []);
    await ctx.close();
  });

  const cases = [
    ["kong", /Setting up an API Gateway|Introduction to API Gateway/],
    ["Yeoman", /Extension Pack for VSCode/], // a word that only appears deep inside an article body
    ["Postman", /Setting up an API Gateway/],
    ["travis", /#travis/],
    ["privacy", /Terms and policies/],
    ["API Gateway 101", /Series/],
  ];
  for (const [query, expected] of cases) {
    it(`finds "${query}" through article/series/topic/page text`, async () => {
      const { ctx, page } = await openPage(env, "/weblog/");
      await page.keyboard.press("/");
      await typed(page, query);
      assert.match(await page.getByRole("dialog").innerText(), expected);
      await ctx.close();
    });
  }

  it("navigates with ArrowDown + Enter to the right URL under /weblog/, closes, and the article renders", async () => {
    const { ctx, page, problems } = await openPage(env, "/weblog/");
    await page.keyboard.press("/");
    await typed(page, "Postman");
    await page.keyboard.press("Enter");
    await page.waitForURL(`**${SETUP}`);
    assert.equal(await page.getByRole("dialog").count(), 0);
    await page
      .locator("h1")
      .filter({ hasText: /API Gateway/ })
      .waitFor();
    assert.deepEqual(problems(), []);
    await ctx.close();
  });

  it("selects results with the arrow keys (aria-activedescendant follows)", async () => {
    const { ctx, page } = await openPage(env, "/weblog/");
    await page.keyboard.press("/");
    await typed(page, "gateway");
    await results(page).nth(1).waitFor();
    const input = page.locator('input[role="combobox"]');
    const first = await input.getAttribute("aria-activedescendant");
    await page.keyboard.press("ArrowDown");
    assert.notEqual(await input.getAttribute("aria-activedescendant"), first);
    await ctx.close();
  });

  it("says so when nothing matches", async () => {
    const { ctx, page } = await openPage(env, "/weblog/");
    await page.keyboard.press("/");
    await page.keyboard.type("zzzzqqqq", { delay: 15 });
    assert.match(await page.getByRole("dialog").innerText(), /No results for/);
    await ctx.close();
  });

  it("works by tap on a phone-sized screen and does not overflow", async () => {
    const { ctx, page } = await openPage(env, "/weblog/", { width: 390, height: 844 });
    await page.getByRole("button", { name: /^Search/ }).click();
    await typed(page, "kong");
    const box = await page.getByRole("dialog").boundingBox();
    assert.ok(box.x >= 0 && box.x + box.width <= 390, "dialog fits the viewport");
    await results(page).first().click();
    await page.waitForURL((u) => u.pathname !== "/weblog/" && u.pathname.startsWith("/weblog/"));
    assert.equal(await page.getByRole("dialog").count(), 0);
    await page.locator("h1").first().waitFor();
    await ctx.close();
  });
});
