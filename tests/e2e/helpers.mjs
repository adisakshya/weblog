import { spawn } from "node:child_process";
import { chromium } from "playwright";

export const ROUTES = [
  "/weblog/",
  "/weblog/2021/07/30/extension-pack-for-vscode-and-code-server.html",
  "/weblog/2022/02/01/introduction-to-api-gateway.html",
  "/weblog/2022/07/16/setting-up-an-api-ateway-for-your-microservices.html",
  "/weblog/about/",
  "/weblog/contact/",
  "/weblog/terms/",
  "/weblog/series/api-gateway-101/",
  "/weblog/series/blogging-101/",
  ...[
    "api-gateway",
    "kong",
    "microservices",
    "docker",
    "vscode",
    "code-server",
    "github",
    "ci-cd",
    "travis",
  ].map((t) => `/weblog/tags/${t}/`),
];

/** Start scripts/serve-dist.mjs (a GitHub-Pages-faithful static server) and a browser. */
export async function start(port = 4300 + Math.floor(Math.random() * 500)) {
  const server = spawn(process.execPath, ["scripts/serve-dist.mjs"], {
    env: { ...process.env, PORT: String(port) },
    stdio: ["ignore", "pipe", "inherit"],
  });
  await new Promise((res, rej) => {
    server.stdout.on("data", (d) => String(d).includes("serving") && res());
    server.on("exit", (c) => rej(new Error(`server exited ${c}`)));
  });
  const browser = await chromium.launch();
  const base = `http://127.0.0.1:${port}`;
  return {
    base,
    browser,
    async stop() {
      await browser.close();
      server.kill();
    },
  };
}

/** Collect problems on a page: console errors, page errors, failed or non-2xx *local* requests. */
export function watch(page, base) {
  const problems = [];
  page.on("pageerror", (e) => problems.push(`pageerror: ${e.message}`));
  page.on("console", (m) => m.type() === "error" && problems.push(`console: ${m.text()}`));
  page.on("response", (r) => {
    if (r.url().startsWith(base) && r.status() >= 400 && r.request().resourceType() !== "document")
      problems.push(`${r.status()} ${r.url()}`);
  });
  page.on("requestfailed", (r) => {
    if (r.url().startsWith(base)) problems.push(`failed ${r.url()}`);
  });
  return problems;
}

export const ARTICLES = ROUTES.filter((r) => r.endsWith(".html"));
export const SETUP = "/weblog/2022/07/16/setting-up-an-api-ateway-for-your-microservices.html";
export const INTRO = "/weblog/2022/02/01/introduction-to-api-gateway.html";
export const EXT = "/weblog/2021/07/30/extension-pack-for-vscode-and-code-server.html";

const IGNORED = /ERR_FAILED|ERR_BLOCKED|fonts\./;

/** A fresh page (third-party font stylesheets are blocked: they are not under test and may be slow). */
export async function openPage(
  env,
  route,
  {
    width = 1440,
    height = 900,
    colorScheme = "light",
    init,
    permissions,
    touch = false,
    storageState,
    fontScale,
    reducedMotion,
  } = {},
) {
  const ctx = await env.browser.newContext({
    viewport: { width, height },
    colorScheme,
    permissions,
    storageState,
    ...(reducedMotion ? { reducedMotion } : {}),
    // a phone: touch input, mobile viewport semantics (no hover), 2x pixels
    ...(touch ? { hasTouch: true, isMobile: true, deviceScaleFactor: 2 } : {}),
  });
  await ctx.route(/fonts\.(googleapis|gstatic|cdnfonts)\.com/, (r) => r.abort());
  if (init) await ctx.addInitScript(init);
  // enlarged text (a reader's browser font-size setting): scales everything sized in rem/em
  if (fontScale)
    await ctx.addInitScript(
      `document.addEventListener("DOMContentLoaded",()=>{document.documentElement.style.fontSize="${fontScale * 100}%"})`,
    );
  const page = await ctx.newPage();
  const problems = watch(page, env.base);
  if (route) await page.goto(env.base + route, { waitUntil: "networkidle" });
  return { ctx, page, problems: () => problems.filter((p) => !IGNORED.test(p)) };
}
