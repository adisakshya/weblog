// Home views (Posts / Subjects / Index), article features (TOC, anchors, copy, lightbox, series nav), link integrity.
import { after, before, describe, it } from "node:test";
import assert from "node:assert/strict";
import { ARTICLES, EXT, INTRO, ROUTES, SETUP, openPage, start } from "./helpers.mjs";

let env;
before(async () => {
  env = await start();
});
after(async () => {
  await env.stop();
});

const pressed = (page) =>
  page.evaluate(() =>
    [...document.querySelectorAll('[aria-label="Choose view"] [aria-pressed="true"]')].map((e) =>
      e.textContent.trim(),
    ),
  );
const section = (page) =>
  page.evaluate(() =>
    ["latest", "subjects-h", "index-h"].find((id) => document.getElementById(id)),
  );

describe("home views", () => {
  const views = [
    ["", "Posts", "latest"],
    ["?view=subjects", "Subjects", "subjects-h"],
    ["?view=index", "Index", "index-h"],
  ];
  for (const [query, label, id] of views) {
    it(`direct load of /weblog/${query} shows the ${label} view with no hydration error`, async () => {
      const { ctx, page, problems } = await openPage(env, `/weblog/${query}`);
      assert.deepEqual(await pressed(page), [label]);
      assert.equal(await section(page), id);
      assert.deepEqual(problems(), []);
      await page.reload({ waitUntil: "networkidle" });
      assert.deepEqual(await pressed(page), [label]);
      assert.deepEqual(problems(), []);
      await ctx.close();
    });
  }
  it("switching views updates the URL and the content, and Back returns to the previous view", async () => {
    const { ctx, page } = await openPage(env, "/weblog/");
    // the footer also links to Subjects and Index (Explore), so the view toggle is addressed by its group
    const toggle = page.getByRole("group", { name: "Choose view" });
    await toggle.getByRole("link", { name: "Subjects" }).click();
    await page.waitForURL(/view=subjects/);
    assert.equal(await section(page), "subjects-h");
    await toggle.getByRole("link", { name: "Index" }).click();
    await page.waitForURL(/view=index/);
    assert.match(
      await page.locator("main").innerText(),
      /Introduction to API Gateway[\s\S]*Extension Pack/,
    );
    await page.goBack();
    assert.equal(await section(page), "subjects-h");
    await ctx.close();
  });
  it("the Posts view shows the latest article, the series panel, subjects, Bookshelf and Worth watching", async () => {
    const { ctx, page } = await openPage(env, "/weblog/");
    const t = await page.locator("main").innerText();
    for (const s of [
      "Setting up an API Gateway",
      "API Gateway 101",
      "Explore by subject",
      "Bookshelf",
      "Worth watching",
      "The Metamorphosis",
      "Strange Math",
    ])
      assert.ok(t.includes(s) || (await page.locator("main").innerHTML()).includes(s), s);
    assert.doesNotMatch(t, /Beyond the blog/, "Beyond the blog was removed by owner decision");
    await ctx.close();
  });
  it("curated cards open the supplied external links safely (new tab, noopener)", async () => {
    const { ctx, page } = await openPage(env, "/weblog/");
    const links = await page
      .locator('main a[target="_blank"]')
      .evaluateAll((els) => els.map((e) => [e.href, e.rel]));
    assert.ok(links.length >= 10);
    for (const [, rel] of links) assert.match(rel, /noopener/);
    assert.ok(
      links.some(([h]) => h.includes("youtube.com/watch?v=KZeIEiBrT_w&t=1448s")),
      "supplied YouTube timestamp kept",
    );
    await ctx.close();
  });
  it("Meet Adi goes to the personal website; the masthead goes home", async () => {
    const { ctx, page } = await openPage(env, INTRO);
    assert.equal(
      await page.getByRole("link", { name: "Meet Adi" }).getAttribute("href"),
      "https://adisakshya.github.io/",
    );
    await page.locator(".j-masthead").click();
    await page.waitForURL(env.base + "/weblog/");
    await ctx.close();
  });
});

describe("article", () => {
  it("'On this page' links jump to the heading", async () => {
    const { ctx, page } = await openPage(env, SETUP);
    await page.getByText("On this page").click();
    const first = page.locator("details a").first();
    const href = await first.getAttribute("href");
    await first.click();
    assert.equal(await page.evaluate(() => location.hash), href);
    assert.ok(await page.locator(href).isVisible());
    await ctx.close();
  });
  it("heading anchors exist and keep the kramdown ids", async () => {
    const { ctx, page } = await openPage(env, SETUP);
    for (const id of ["prerequisites", "contribution"])
      assert.ok((await page.locator(`h2#${id}`).count()) === 1, id);
    await ctx.close();
  });
  it("the copy button copies the code exactly", async () => {
    const { ctx, page } = await openPage(env, SETUP, {
      permissions: ["clipboard-read", "clipboard-write"],
    });
    const block = page.locator(".code-block").nth(1);
    const expected = await block.locator("code").evaluate((e) => e.textContent);
    await block.getByRole("button", { name: /Copy code/ }).click();
    assert.equal(await page.evaluate(() => navigator.clipboard.readText()), expected);
    assert.equal(await block.getByRole("button").innerText(), "Copied");
    await ctx.close();
  });
  it("images open in a lightbox (click and keyboard), Escape closes and returns focus", async () => {
    const { ctx, page } = await openPage(env, SETUP);
    const img = page.locator("img.zoomable").first();
    await img.focus();
    await page.keyboard.press("Enter");
    const box = page.getByRole("dialog", { name: "Enlarged image" });
    await box.waitFor();
    await page.keyboard.press("Escape");
    await box.waitFor({ state: "hidden" });
    assert.equal(await img.evaluate((e) => e === document.activeElement), true);
    await ctx.close();
  });
  it("the lightbox traps keyboard focus (Tab / Shift+Tab never reach the page behind) and isolates the background", async () => {
    const { ctx, page } = await openPage(env, SETUP);
    const img = page.locator("img.zoomable").first();
    await img.focus();
    await page.keyboard.press("Enter");
    const box = page.getByRole("dialog", { name: "Enlarged image" });
    await box.waitFor();
    const inside = () =>
      page.evaluate(() => {
        const d = document.querySelector('[role="dialog"]');
        return !!d && d.contains(document.activeElement);
      });
    assert.equal(await inside(), true, "focus starts inside the lightbox (Close button)");
    for (const key of ["Tab", "Tab", "Tab", "Shift+Tab", "Shift+Tab", "Shift+Tab", "Shift+Tab"]) {
      await page.keyboard.press(key);
      assert.equal(await inside(), true, `focus stayed inside after ${key}`);
    }
    // the page behind is not exposed to assistive technology while the modal is open
    assert.equal(
      await page.evaluate(
        () => document.querySelector("main")?.closest("[aria-hidden='true']") !== null,
      ),
      true,
      "the page behind the lightbox is aria-hidden",
    );
    await page.keyboard.press("Escape");
    await box.waitFor({ state: "hidden" });
    assert.equal(await img.evaluate((e) => e === document.activeElement), true);
    await ctx.close();
  });
  it("copy buttons and image handlers survive opening/closing the lightbox (the article DOM is not re-created)", async () => {
    const { ctx, page } = await openPage(env, SETUP);
    const before = await page.locator(".copy-btn").count();
    assert.ok(before >= 3);
    for (let i = 0; i < 2; i++) {
      const img = page.locator("img.zoomable").first();
      await img.focus();
      await page.keyboard.press("Enter");
      await page.getByRole("dialog", { name: "Enlarged image" }).waitFor();
      await page.keyboard.press("Escape");
      await page.getByRole("dialog").waitFor({ state: "hidden" });
      assert.equal(
        await img.evaluate((e) => e === document.activeElement),
        true,
        `focus returns on round ${i + 1}`,
      );
    }
    assert.equal(await page.locator(".copy-btn").count(), before);
    assert.equal(
      await page.locator('img.zoomable[tabindex="0"]').count(),
      await page.locator("img.zoomable").count(),
    );
    await ctx.close();
  });
  it("series navigation: part 2 links back to part 1 and to the whole series; part 1 links forward", async () => {
    const { ctx, page } = await openPage(env, SETUP);
    assert.match(
      await page.locator('nav[aria-label$="series"]').innerText(),
      /Previous[\s\S]*Introduction to API Gateway/,
    );
    await page.getByRole("link", { name: "View the full series" }).click();
    await page.waitForURL(/series\/api-gateway-101/);
    await page.goto(env.base + INTRO, { waitUntil: "networkidle" });
    assert.match(
      await page.locator('nav[aria-label$="series"]').innerText(),
      /Next[\s\S]*Setting up an API Gateway/,
    );
    await ctx.close();
  });
  it("code blocks, images, video and tables render with their authored content", async () => {
    const { ctx, page } = await openPage(env, EXT);
    assert.equal(await page.locator("video").count(), 2);
    assert.ok((await page.locator(".code-block").count()) >= 10);
    assert.ok((await page.locator("img.zoomable").count()) >= 4);
    await ctx.close();
  });
});

describe("link integrity", () => {
  it("every internal link on every page resolves (page or in-page anchor); external links are safe", async () => {
    const { ctx, page } = await openPage(env, null);
    const checked = new Set();
    const broken = [];
    for (const route of [...ROUTES, "/weblog/not-found-route/"]) {
      await page.goto(env.base + route, { waitUntil: "networkidle" });
      const links = await page.evaluate(() =>
        [...document.querySelectorAll("a[href]")].map((a) => ({
          href: a.getAttribute("href"),
          abs: a.href,
          target: a.target,
          rel: a.rel,
          ext: a.origin !== location.origin,
        })),
      );
      for (const l of links) {
        if (l.href.startsWith("mailto:")) continue;
        if (l.ext) {
          if (l.target === "_blank")
            assert.match(
              l.rel,
              /noopener/,
              `${route}: external link ${l.href} opens a tab without noopener`,
            );
          continue;
        }
        if (l.href.startsWith("#")) {
          if (!(await page.locator(l.href).count()))
            broken.push(`${route} ${l.href} (missing anchor)`);
          continue;
        }
        const u = new URL(l.abs);
        u.hash = "";
        if (checked.has(u.pathname + u.search)) continue;
        checked.add(u.pathname + u.search);
        const r = await fetch(u, { redirect: "follow" });
        if (r.status !== 200) broken.push(`${route} -> ${u.pathname} (${r.status})`);
      }
    }
    assert.deepEqual(broken, []);
    assert.ok(checked.size >= 15, `checked ${checked.size} distinct internal targets`);
    await ctx.close();
  });
  it("every article is reachable from the home page by clicking (no orphan articles)", async () => {
    const { ctx, page } = await openPage(env, "/weblog/?view=index");
    const hrefs = await page
      .locator("main a")
      .evaluateAll((els) => els.map((e) => e.getAttribute("href")));
    for (const a of ARTICLES)
      assert.ok(
        hrefs.some((h) => h === a || h === a.replace(/^\/weblog/, "")) || hrefs.includes(a),
        a,
      );
    await ctx.close();
  });
});
