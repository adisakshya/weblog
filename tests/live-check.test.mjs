// scripts/live-check.mjs decides whether a deployment is good, so it must FAIL on realistic faults (not just pass on a good site).
// A reverse proxy in front of the real static build injects each fault.   Requires: bun run build
import { after, before, describe, it } from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { createServer } from "node:http";

let real, upstreamPort;
const servers = [];

before(async () => {
  upstreamPort = 4700 + Math.floor(Math.random() * 100);
  real = spawn(process.execPath, ["scripts/serve-dist.mjs"], {
    env: { ...process.env, PORT: String(upstreamPort) },
    stdio: ["ignore", "pipe", "inherit"],
  });
  await new Promise((res) => real.stdout.on("data", (d) => String(d).includes("serving") && res()));
});
after(() => {
  real.kill();
  servers.forEach((s) => s.close());
});

/** Proxy to the real build; `fault(path)` may return { status, type, body } to override a response. */
async function withFault(fault) {
  const upstream = `http://127.0.0.1:${upstreamPort}`;
  const server = createServer(async (req, res) => {
    const o = fault?.(req.url);
    if (o)
      return void res
        .writeHead(o.status ?? 200, { "content-type": o.type ?? "text/html" })
        .end(o.body ?? "");
    const r = await fetch(upstream + req.url, { redirect: "manual" });
    const headers = {};
    r.headers.forEach((v, k) => {
      if (!["content-encoding", "content-length", "transfer-encoding", "connection"].includes(k))
        headers[k] = v;
    });
    res.writeHead(r.status, headers).end(Buffer.from(await r.arrayBuffer()));
  });
  await new Promise((res) => server.listen(0, "127.0.0.1", res));
  servers.push(server);
  return `http://127.0.0.1:${server.address().port}`;
}
// async on purpose: the fault-injecting proxy lives in THIS process, so a blocking spawnSync would deadlock it
const run = (base) =>
  new Promise((resolve) => {
    const child = spawn(process.execPath, ["scripts/live-check.mjs", base]);
    let stdout = "";
    child.stdout.on("data", (d) => (stdout += d));
    child.on("close", (status) => resolve({ status, stdout }));
  });
const home = async () => (await fetch(`http://127.0.0.1:${upstreamPort}/weblog/`)).text();
const page = async (p) => (await fetch(`http://127.0.0.1:${upstreamPort}${p}`)).text();

describe("live-check", () => {
  it("passes on the real build", async () => {
    const r = await run(await withFault(null));
    assert.equal(r.status, 0, r.stdout);
    assert.match(r.stdout, /live-check OK/);
  });

  it("FAILS when the home page is served at every article, tag, series and page URL (the false-pass Codex reproduced)", async () => {
    const homeHtml = await home();
    const r = await run(
      await withFault((p) =>
        /^\/weblog\/(\d{4}\/|tags\/|series\/|about|contact|terms)/.test(p)
          ? { body: homeHtml }
          : null,
      ),
    );
    assert.equal(r.status, 1, r.stdout);
    for (const route of [
      "/weblog/2022/02/01/introduction-to-api-gateway.html",
      "/weblog/tags/kong/",
      "/weblog/series/api-gateway-101/",
      "/weblog/contact/",
      "/weblog/terms/",
    ]) {
      assert.match(
        r.stdout,
        new RegExp(route.replace(/[/.]/g, "\\$&")),
        `${route} must be reported`,
      );
    }
  });

  it("FAILS when one page is served at another page's URL (terms URL serves contact)", async () => {
    const contact = await page("/weblog/contact/");
    const r = await run(
      await withFault((p) => (p === "/weblog/terms/" ? { body: contact } : null)),
    );
    assert.equal(r.status, 1);
    assert.match(r.stdout, /\/weblog\/terms\/.*(h1|canonical)/s);
  });

  it("FAILS when an article serves a different article", async () => {
    const other = await page("/weblog/2022/02/01/introduction-to-api-gateway.html");
    const r = await run(
      await withFault((p) =>
        p === "/weblog/2021/07/30/extension-pack-for-vscode-and-code-server.html"
          ? { body: other }
          : null,
      ),
    );
    assert.equal(r.status, 1);
    assert.match(r.stdout, /extension-pack/);
  });

  it("FAILS on a soft 404 (unknown URL answered 200)", async () => {
    const homeHtml = await home();
    const r = await run(
      await withFault((p) =>
        p.startsWith("/weblog/this-page-does-not-exist") ? { status: 200, body: homeHtml } : null,
      ),
    );
    assert.equal(r.status, 1);
    assert.match(r.stdout, /unknown route/);
  });

  it("FAILS when a development file is published (the Jekyll site served /weblog/Gemfile)", async () => {
    const r = await run(
      await withFault((p) =>
        p === "/weblog/Gemfile"
          ? { type: "application/octet-stream", body: "source 'https://rubygems.org'" }
          : null,
      ),
    );
    assert.equal(r.status, 1);
    assert.match(r.stdout, /development file \/weblog\/Gemfile/);
  });

  it("FAILS when the sitemap or feed is missing", async () => {
    const r = await run(
      await withFault((p) =>
        p === "/weblog/sitemap.xml" || p === "/weblog/feed.xml"
          ? { status: 404, body: "nope" }
          : null,
      ),
    );
    assert.equal(r.status, 1);
    assert.match(r.stdout, /sitemap\.xml/);
  });

  it("FAILS when the home page is the Index view instead of Posts", async () => {
    const idx = (await home()).replace(
      'aria-label="Posts" aria-pressed="true"',
      'aria-label="Posts" aria-pressed="false"',
    );
    const r = await run(await withFault((p) => (p === "/weblog/" ? { body: idx } : null)));
    assert.equal(r.status, 1);
    assert.match(r.stdout, /not the Posts view/);
  });
});
