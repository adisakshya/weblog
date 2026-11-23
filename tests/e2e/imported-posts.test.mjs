// Posts imported from HackerNoon (#39): they live at their UTC-date URLs, name HackerNoon as the canonical source, say so in
// the text, show their own image (never another post's artwork) on the home page, and do not show the image twice.
import { after, before, describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { openPage, start } from "./helpers.mjs";

const SLACK =
  "/weblog/2024/08/29/how-to-send-detailed-slack-notifications-from-github-actions.html";
const TUPLES = "/weblog/2024/08/30/understanding-python-memory-efficiency-tuples-vs-lists.html";
const ORIGINAL = {
  [SLACK]: "https://hackernoon.com/how-to-send-detailed-slack-notifications-from-github-actions",
  [TUPLES]: "https://hackernoon.com/understanding-python-memory-efficiency-tuples-vs-lists",
};
// a 1x1 PNG, so the tests do not depend on the image host being reachable
const PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
  "base64",
);

let env;
before(async () => {
  env = await start();
});
after(async () => {
  await env.stop();
});
const open = async (route) => {
  const o = await openPage(env, null);
  await o.ctx.route(/res\.cloudinary\.com/, (r) =>
    r.fulfill({ body: PNG, contentType: "image/png" }),
  );
  await o.page.goto(env.base + (route ?? "/weblog/"), { waitUntil: "networkidle" });
  return o;
};

describe("imported posts", () => {
  for (const route of [SLACK, TUPLES]) {
    it(`${route}: canonical is HackerNoon, the text says where it was first published, one top image`, async () => {
      const { ctx, page, problems } = await open(route);
      assert.equal(
        await page.locator('link[rel="canonical"]').getAttribute("href"),
        ORIGINAL[route],
      );
      const text = await page.locator("article").innerText();
      assert.match(
        text,
        /Originally published on HackerNoon\s*(?:\(opens in a new tab\)\s*)?on August (29|30), 2024/,
      );
      const link = page.getByRole("link", { name: /^HackerNoon/ });
      assert.equal(await link.getAttribute("href"), ORIGINAL[route]);
      assert.match((await link.getAttribute("rel")) ?? "", /noopener noreferrer/);
      // the featured image is in the article text; the page must not add a second copy at the top
      const first = await page.locator("article img").first().getAttribute("src");
      const same = await page.locator(`article img[src="${first}"]`).count();
      assert.equal(same, 1, "the featured image appears once");
      assert.deepEqual(problems(), []);
      await ctx.close();
    });
  }

  it("no built page loads anything from hackernoon.imgix.net (AGENTS.md: no third-party runtime dependency)", () => {
    for (const f of [
      "dist/client/index.html",
      "dist/client/2024/08/29/how-to-send-detailed-slack-notifications-from-github-actions.html",
      "dist/client/2024/08/30/understanding-python-memory-efficiency-tuples-vs-lists.html",
      "dist/client/tags/python/index.html",
      "dist/client/feed.xml",
    ])
      assert.ok(!readFileSync(f, "utf8").includes("hackernoon.imgix.net"), f);
  });

  it("the UTC date of 12:00 +0530 is the same calendar day (the URL carries it)", async () => {
    const { ctx, page } = await open(SLACK);
    assert.match(
      await page.locator("article time").first().getAttribute("datetime"),
      /^2024-08-29T06:30/,
    );
    await ctx.close();
  });

  it("the home page shows each imported post's own image, not the Extension Pack artwork", async () => {
    const { ctx, page } = await open();
    for (const title of [
      "How to Send Detailed Slack Notifications from GitHub Actions?",
      "Understanding Python Memory Efficiency: Tuples vs. Lists",
    ]) {
      const card = page.locator("article", { has: page.getByRole("heading", { name: title }) });
      assert.equal(await card.locator("svg[role=img]").count(), 0, `${title}: no artwork`);
      const src = await card.locator("img").first().getAttribute("src");
      assert.match(src, /^https:\/\/res\.cloudinary\.com\/adisakshya\//);
    }
    const ids = await page.evaluate(() => [...document.querySelectorAll("[id]")].map((e) => e.id));
    assert.deepEqual(
      ids.filter((id, i) => ids.indexOf(id) !== i),
      [],
      "ids are unique",
    );
    await ctx.close();
  });

  it("their tags have pages and the posts are listed there", async () => {
    for (const [tag, title] of [
      ["github-actions", "How to Send Detailed Slack Notifications"],
      ["python", "Understanding Python Memory Efficiency"],
    ]) {
      const { ctx, page } = await open(`/weblog/tags/${tag}/`);
      assert.match(await page.locator("main").innerText(), new RegExp(title));
      await ctx.close();
    }
  });
});
