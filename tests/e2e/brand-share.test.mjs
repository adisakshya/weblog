// Favicon set and default share image (#85) against the BUILT static site under /weblog/.
import { after, before, describe, it } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { ARTICLES, ROUTES, start } from "./helpers.mjs";

let env;
before(async () => {
  env = await start();
});
after(async () => {
  await env.stop();
});

const DIST = "dist/client";
const BRAND = "docs/brand/assets";
const FILES = [
  "favicon.ico",
  "favicon.svg",
  "apple-touch-icon.png",
  "favicon-192.png",
  "favicon-512.png",
  "og-image.png",
];
const sha = (path) => createHash("sha256").update(readFileSync(path)).digest("hex");
const listed = Object.fromEntries(
  readFileSync(`${BRAND}/SHA256SUMS`, "utf8")
    .trim()
    .split("\n")
    .map((l) => l.split(/\s+/).reverse()),
);
const walk = (dir) =>
  readdirSync(dir).flatMap((f) =>
    statSync(join(dir, f)).isDirectory() ? walk(join(dir, f)) : [join(dir, f)],
  );
const htmlFiles = () => walk(DIST).filter((f) => f.endsWith(".html"));
const pngSize = (path) => {
  const b = readFileSync(path);
  assert.equal(b.subarray(1, 4).toString(), "PNG");
  return [b.readUInt32BE(16), b.readUInt32BE(20)];
};
const fileFor = (route) => {
  const rel = route.replace(/^\/weblog\//, "");
  return rel === ""
    ? `${DIST}/index.html`
    : rel.endsWith(".html")
      ? `${DIST}/${rel}`
      : `${DIST}/${rel}index.html`;
};
const metaAll = (h, attr, key) =>
  [...h.matchAll(new RegExp(`<meta[^>]*${attr}="${key}"[^>]*content="([^"]*)"`, "g"))].map(
    (m) => m[1],
  );

describe("the shipped files are the approved brand files, byte for byte", () => {
  for (const f of FILES)
    it(`${f}: dist = public = docs/brand/assets = SHA256SUMS`, () => {
      const approved = sha(`${BRAND}/${f}`);
      assert.equal(approved, listed[f], "the approved file matches its recorded checksum");
      assert.equal(sha(`public/${f}`), approved, "public/");
      assert.equal(sha(`${DIST}/${f}`), approved, "dist/client/");
    });

  it("the files are what they claim to be", () => {
    assert.deepEqual(pngSize(`${DIST}/og-image.png`), [1200, 630]);
    assert.deepEqual(pngSize(`${DIST}/apple-touch-icon.png`), [180, 180]);
    assert.deepEqual(pngSize(`${DIST}/favicon-192.png`), [192, 192]);
    assert.deepEqual(pngSize(`${DIST}/favicon-512.png`), [512, 512]);
    const ico = readFileSync(`${DIST}/favicon.ico`);
    assert.equal(ico.readUInt16LE(2), 1, "an icon file");
    const sizes = Array.from(
      { length: ico.readUInt16LE(4) },
      (_, i) => ico[6 + i * 16] || 256,
    ).sort((a, b) => a - b);
    assert.deepEqual(sizes, [16, 32, 48]);
    assert.match(readFileSync(`${DIST}/favicon.svg`, "utf8"), /^<svg /);
  });

  it("each is served under /weblog/ with its own bytes (a direct load works)", async () => {
    const types = {
      ico: /image\/(x-icon|vnd\.microsoft\.icon)/,
      svg: /image\/svg\+xml/,
      png: /image\/png/,
    };
    for (const f of FILES) {
      const r = await fetch(`${env.base}/weblog/${f}`);
      assert.equal(r.status, 200, f);
      assert.match(r.headers.get("content-type") ?? "", types[f.split(".").pop()], f);
      assert.equal(
        createHash("sha256")
          .update(Buffer.from(await r.arrayBuffer()))
          .digest("hex"),
        listed[f],
        `${f} bytes`,
      );
    }
  });
});

describe("every icon link resolves", () => {
  it("every <link rel=icon|apple-touch-icon> on every prerendered page (the 404 page too) returns 200", async () => {
    const hrefs = new Set();
    for (const f of htmlFiles()) {
      const h = readFileSync(f, "utf8");
      const links = [...h.matchAll(/<link[^>]*rel="(?:icon|apple-touch-icon)"[^>]*>/g)].map(
        (m) => m[0],
      );
      assert.equal(links.length, 3, `${f}: svg icon, ico fallback, apple-touch-icon`);
      for (const l of links) {
        const href = l.match(/href="([^"]+)"/)[1];
        assert.match(href, /^\/weblog\//, `${f}: ${href} is under the base path`);
        hrefs.add(href);
      }
    }
    assert.deepEqual([...hrefs].sort(), [
      "/weblog/apple-touch-icon.png",
      "/weblog/favicon.ico",
      "/weblog/favicon.svg",
    ]);
    for (const href of hrefs) assert.equal((await fetch(env.base + href)).status, 200, href);
  });

  it("the home page links the SVG first and the ICO as its fallback", () => {
    const h = readFileSync(`${DIST}/index.html`, "utf8");
    const icons = [...h.matchAll(/<link[^>]*rel="icon"[^>]*>/g)].map((m) => m[0]);
    assert.match(
      icons[0],
      /favicon\.svg[^>]*type="image\/svg\+xml"|type="image\/svg\+xml"[^>]*favicon\.svg/,
    );
    assert.match(icons[1], /favicon\.ico/);
  });
});

describe("share image per route", () => {
  const DEFAULT = "https://adisakshya.github.io/weblog/og-image.png";
  const postFrontMatter = () =>
    Object.fromEntries(
      readdirSync("_posts").map((f) => {
        const md = readFileSync(`_posts/${f}`, "utf8");
        return [
          f.replace(/^\d{4}-\d{2}-\d{2}-/, "").replace(/\.md$/, ""),
          md.match(/^\s*teaser:\s*(\S+)/m)?.[1] ?? null,
        ];
      }),
    );

  it("every content route has exactly one absolute og:image and one twitter:image; the default carries its size and alt", () => {
    for (const route of ROUTES.filter((r) => !ARTICLES.includes(r))) {
      const h = readFileSync(fileFor(route), "utf8");
      assert.deepEqual(metaAll(h, "property", "og:image"), [DEFAULT], `${route}: og:image`);
      assert.deepEqual(metaAll(h, "name", "twitter:image"), [DEFAULT], `${route}: twitter:image`);
      assert.deepEqual(metaAll(h, "property", "og:image:width"), ["1200"], route);
      assert.deepEqual(metaAll(h, "property", "og:image:height"), ["630"], route);
      assert.deepEqual(metaAll(h, "property", "og:image:alt"), ["Adisakshya Chauhan"], route);
      assert.deepEqual(
        metaAll(h, "name", "twitter:card"),
        ["summary_large_image"],
        `${route}: a large card for a 1200x630 image`,
      );
    }
  });

  it("posts keep their own image (unchanged, exactly one) and do not also carry the default", () => {
    const own = postFrontMatter();
    for (const route of ARTICLES) {
      const h = readFileSync(fileFor(route), "utf8");
      const slug = route
        .split("/")
        .pop()
        .replace(/\.html$/, "");
      assert.ok(own[slug], `${slug} has a teaser in its front matter`);
      assert.deepEqual(
        metaAll(h, "property", "og:image"),
        [own[slug]],
        `${route}: og:image is the post's own`,
      );
      assert.deepEqual(metaAll(h, "name", "twitter:image"), [own[slug]], route);
      assert.ok(!h.includes("og-image.png"), `${route}: the default image is not added on top`);
    }
  });

  it("the root layout adds none: the not-found page (root only) has no og:image or twitter:image", () => {
    const h = readFileSync(`${DIST}/404.html`, "utf8");
    assert.deepEqual(metaAll(h, "property", "og:image"), []);
    assert.deepEqual(metaAll(h, "name", "twitter:image"), []);
    const root = readFileSync("src/routes/__root.tsx", "utf8");
    assert.doesNotMatch(
      root,
      /property:\s*"og:image"|name:\s*"twitter:image"/,
      "no og:image entry in the root head",
    );
    assert.match(root, /Never add og:image/, "the guard comment stays");
  });

  it("the image URL is absolute and the image is served at it", async () => {
    assert.ok(DEFAULT.startsWith("https://"));
    const r = await fetch(`${env.base}${new URL(DEFAULT).pathname}`);
    assert.equal(r.status, 200);
  });
});
