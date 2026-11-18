#!/usr/bin/env node
/* Capture the visual matrix for the weblog. Used for BOTH the approved Lovable reference and the new site,
 * so the two sets are produced by identical code.
 *   node scripts/capture-visual.cjs <baseUrl> <outDir> [--covers <dir with *.asset.json + jpgs>]
 * Never recapture the reference from the new implementation. */
const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");

const [baseUrl, outDir] = process.argv.slice(2);
const coversIdx = process.argv.indexOf("--covers");
const coversDir = coversIdx > -1 ? process.argv[coversIdx + 1] : null;
if (!baseUrl || !outDir) { console.error("usage: capture-visual.cjs <baseUrl> <outDir> [--covers dir]"); process.exit(2); }
fs.mkdirSync(outDir, { recursive: true });

const WIDTHS = { desktop: { width: 1440, height: 900 }, mobile: { width: 390, height: 844 } };
const ROUTES = {
  "home-posts": "/weblog/",
  "home-index": "/weblog/?view=index",
  "home-subjects": "/weblog/?view=subjects",
  "post-introduction-to-api-gateway": "/weblog/2022/02/01/introduction-to-api-gateway.html",
  "post-setting-up-api-gateway": "/weblog/2022/07/16/setting-up-an-api-ateway-for-your-microservices.html",
  "post-extension-pack": "/weblog/2021/07/30/extension-pack-for-vscode-and-code-server.html",
  "tag-kong": "/weblog/tags/kong/",
  "series-api-gateway-101": "/weblog/series/api-gateway-101/",
  "page-contact": "/weblog/contact/",
  "page-terms": "/weblog/terms/",
  "not-found": "/weblog/this-page-does-not-exist/",
};
const THEMES = ["original", "system", "paper", "sepia", "dark-modern", "solarized-light", "solarized-dark", "space", "spiderman", "batman", "superman", "ironman"];

// Lovable-only asset URLs (/__l5e/assets-v1/<id>/<file>) are served from the recovered originals.
const coverById = {};
if (coversDir) {
  for (const f of fs.readdirSync(path.join(coversDir, "meta"))) {
    if (!f.endsWith(".asset.json")) continue;
    const m = JSON.parse(fs.readFileSync(path.join(coversDir, "meta", f), "utf8"));
    coverById[m.asset_id] = path.join(coversDir, m.original_filename);
  }
}

async function settle(page) {
  await page.waitForLoadState("networkidle").catch(() => {});
  await page.evaluate(() => document.fonts && document.fonts.ready).catch(() => {});
  await page.waitForTimeout(400);
}
async function open(browser, size, theme) {
  const ctx = await browser.newContext({ viewport: size, deviceScaleFactor: 1, reducedMotion: "reduce", colorScheme: "light" });
  if (theme) await ctx.addInitScript((t) => localStorage.setItem("journal-prefs", JSON.stringify({ theme: t, font: "serif", size: "comfortable", width: "roomy" })), theme);
  await ctx.route(/\/__l5e\/assets-v1\//, (route) => {
    const id = route.request().url().split("/assets-v1/")[1].split("/")[0];
    const file = coverById[id];
    return file ? route.fulfill({ status: 200, contentType: "image/jpeg", body: fs.readFileSync(file) }) : route.continue();
  });
  return ctx;
}

(async () => {
  const browser = await chromium.launch();
  const log = [];
  // Full-page for short routes; viewport-only for panels/themes; articles are capped to the top 1800px
  // (header, cover, TOC, opening prose) to keep the committed baseline small. Bodies are covered by content tests.
  const shot = async (page, name, w, mode = "full") => {
    const file = path.join(outDir, `${name}--${w}.png`);
    const vp = page.viewportSize();
    const opts = { path: file, animations: "disabled" };
    if (mode === "full") opts.fullPage = true;
    else if (mode === "top") { opts.fullPage = true; opts.clip = { x: 0, y: 0, width: vp.width, height: 1800 }; }
    await page.screenshot(opts);
    log.push({ name, w, file: path.basename(file), status: page.__status });
  };
  for (const [w, size] of Object.entries(WIDTHS)) {
    const ctx = await open(browser, size);
    const page = await ctx.newPage();
    for (const [name, route] of Object.entries(ROUTES)) {
      const resp = await page.goto(baseUrl + route, { waitUntil: "domcontentloaded" });
      page.__status = resp && resp.status();
      await settle(page);
      await shot(page, name, w, name.startsWith("post-") ? "top" : "full");
    }
    // search dialog + appearance panel on the home page
    await page.goto(baseUrl + "/weblog/", { waitUntil: "domcontentloaded" }); await settle(page);
    await page.keyboard.press("/"); await page.waitForTimeout(500);
    await page.keyboard.type("gateway", { delay: 40 }); await page.waitForTimeout(600);
    await shot(page, "ui-search-open", w, "viewport");
    await page.keyboard.press("Escape");
    await page.goto(baseUrl + "/weblog/", { waitUntil: "domcontentloaded" }); await settle(page);
    await page.getByRole("button", { name: /appearance/i }).first().click(); await page.waitForTimeout(500);
    await shot(page, "ui-appearance-open", w, "viewport");
    await ctx.close();
    for (const t of THEMES) {
      const c = await open(browser, size, t);
      const p = await c.newPage();
      p.__status = 200;
      await p.goto(baseUrl + "/weblog/2022/02/01/introduction-to-api-gateway.html", { waitUntil: "domcontentloaded" }); await settle(p);
      await shot(p, `theme-${t}`, w, "viewport");
      await c.close();
    }
  }
  await browser.close();
  fs.writeFileSync(path.join(outDir, "capture-log.json"), JSON.stringify({ baseUrl, capturedAt: new Date().toISOString(), shots: log }, null, 2));
  console.log(`captured ${log.length} screenshots -> ${outDir}`);
})().catch((e) => { console.error(e); process.exit(1); });
