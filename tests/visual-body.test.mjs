// Body-region comparison (#74/#76): the header and footer were redesigned on purpose, so each shot is compared on its <main>
// region only. The mode must stay strict about the body: it must pass when only the chrome differs, and fail when the body is
// blank, erased or missing, when bounds are missing, or when the page has the shell in only one of reference and new.
//   node --test tests/visual-body.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { cropBodies } = require("../scripts/compare-visual.cjs");
const { PNG } = require("pngjs");

const W = 120;
const fill = (img, x, y, w, h, [r, g, b]) => {
  for (let j = y; j < y + h; j++)
    for (let i = x; i < x + w; i++) {
      const k = (j * img.width + i) * 4;
      img.data[k] = r;
      img.data[k + 1] = g;
      img.data[k + 2] = b;
      img.data[k + 3] = 255;
    }
};
/** A page: `header` rows, a patterned body of `body` rows, `footer` rows. The pattern is a deterministic grid of coloured cells. */
const page = ({ header, body, footer, blankBody = false, erase }) => {
  const img = new PNG({ width: W, height: header + body + footer });
  fill(img, 0, 0, W, img.height, [255, 255, 255]);
  fill(img, 0, 0, W, header, [200, 30, 30]);
  fill(img, 0, header + body, W, footer, [30, 30, 200]);
  if (!blankBody)
    for (let cy = 0; cy < body; cy += 20)
      for (let cx = 0; cx < W; cx += 20)
        if ((cx / 20 + cy / 20) % 2 === 0)
          fill(img, cx, header + cy, 20, 20, [20 + ((cx * 3) % 200), 90, 20 + ((cy * 5) % 200)]);
  if (erase) fill(img, 0, header + erase.top, W, erase.rows, [255, 255, 255]);
  return img;
};
const bounds = (header, body) => ({ top: header, bottom: header + body });

test("cropBodies: the same body under a different header and footer crops to identical pixels", () => {
  const ref = page({ header: 62, body: 400, footer: 90 });
  const neu = page({ header: 81, body: 400, footer: 140 });
  const c = cropBodies(ref, neu, bounds(62, 400), bounds(81, 400), "full");
  assert.equal(c.error, undefined);
  assert.deepEqual([c.ref.width, c.ref.height], [W, 400]);
  assert.ok(Buffer.compare(c.ref.data, c.new.data) === 0, "the body pixels are the same");
});

test("cropBodies: a full-page shot whose body height changed is an error; clipped and viewport shots keep the shared rows", () => {
  const ref = page({ header: 62, body: 400, footer: 0 });
  const neu = page({ header: 81, body: 380, footer: 0 });
  assert.match(
    cropBodies(ref, neu, bounds(62, 400), bounds(81, 380), "full").error,
    /BODY HEIGHT 400 vs 380/,
  );
  const c = cropBodies(ref, neu, bounds(62, 400), bounds(81, 380), "viewport");
  assert.equal(c.ref.height, 380, "viewport shot: the rows both shots share");
});

test("cropBodies: missing bounds, empty or tiny bodies and one-sided shells fail closed", () => {
  const img = page({ header: 10, body: 400, footer: 10 });
  assert.match(cropBodies(img, img, undefined, bounds(10, 400), "full").error, /no <main> bounds/);
  assert.match(cropBodies(img, img, bounds(10, 400), undefined, "full").error, /no <main> bounds/);
  assert.match(
    cropBodies(img, img, bounds(10, 400), bounds(500, 500), "full").error,
    /empty body region/,
  );
  assert.match(
    cropBodies(img, img, bounds(10, 100), bounds(10, 100), "full").error,
    /only 100 shared body rows/,
  );
  assert.match(
    cropBodies(img, img, { chromeless: true }, bounds(10, 400), "full").error,
    /only one of/,
  );
  assert.match(cropBodies(img, img, bounds(10, 400), null, "full").error, /only one of/);
});

test("cropBodies: a page without the site shell (the 404 page) is compared whole when both agree", () => {
  const img = page({ header: 0, body: 400, footer: 0 });
  const c = cropBodies(img, img, { chromeless: true }, null, "full");
  assert.equal(c.ref, img);
  assert.equal(c.new, img);
});

// ---- the CLI end to end, on synthetic reference / new directories ------------------------------------------------------
const tmp = mkdtempSync(join(tmpdir(), "weblog-visual-body-"));
const write = (dir, name, img) => {
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, name), PNG.sync.write(img));
};
const setup = ({ refImg, newImg, newBody, refBounds, skip, extraAllow }) => {
  const root = mkdtempSync(join(tmp, "case-"));
  const ref = join(root, "ref"),
    neu = join(root, "new");
  write(ref, "shot--desktop.png", refImg);
  write(neu, "shot--desktop.png", newImg);
  writeFileSync(
    join(neu, "capture-log.json"),
    JSON.stringify({ shots: [{ file: "shot--desktop.png", mode: "full", body: newBody }] }),
  );
  writeFileSync(
    join(root, "bounds.json"),
    JSON.stringify({ shots: { "shot--desktop.png": refBounds } }),
  );
  writeFileSync(
    join(root, "allow.json"),
    JSON.stringify({ allow: extraAllow ?? {}, bodyOnly: { reason: "test", skip: skip ?? {} } }),
  );
  return { root, ref, neu };
};
const run = ({ root, ref, neu }, mode = "exact") =>
  spawnSync(
    process.execPath,
    [
      "scripts/compare-visual.cjs",
      neu,
      "--ref",
      ref,
      "--allow",
      join(root, "allow.json"),
      "--body-bounds",
      join(root, "bounds.json"),
      "--mode",
      mode,
      "--content-root",
      ".",
    ],
    { encoding: "utf8" },
  );

test("CLI: only the header and footer differ -> passes, and says the comparison is on the body (structural, even if exact was asked)", () => {
  const r = run(
    setup({
      refImg: page({ header: 62, body: 400, footer: 90 }),
      newImg: page({ header: 81, body: 400, footer: 140 }),
      newBody: bounds(81, 400),
      refBounds: { ...bounds(62, 400), mode: "full" },
    }),
  );
  assert.equal(r.status, 0, r.stdout);
  assert.match(r.stdout, /body-region comparison/);
  assert.match(r.stdout, /1\/1 body regions match the approved reference \(structural\)/);
});

test("CLI: a blank body fails even though the header and footer are 'allowed' to differ", () => {
  const r = run(
    setup({
      refImg: page({ header: 62, body: 400, footer: 90 }),
      newImg: page({ header: 81, body: 400, footer: 140, blankBody: true }),
      newBody: bounds(81, 400),
      refBounds: { ...bounds(62, 400), mode: "full" },
    }),
  );
  assert.equal(r.status, 1, r.stdout);
  assert.match(r.stdout, /DIFF shot--desktop\.png: .*blocks differ/);
});

test("CLI: an erased section of the body fails", () => {
  const r = run(
    setup({
      refImg: page({ header: 62, body: 400, footer: 90 }),
      newImg: page({ header: 81, body: 400, footer: 140, erase: { top: 100, rows: 200 } }),
      newBody: bounds(81, 400),
      refBounds: { ...bounds(62, 400), mode: "full" },
    }),
  );
  assert.equal(r.status, 1, r.stdout);
});

test("CLI: a body that changed height fails; missing bounds for the shot fail closed", () => {
  const changed = run(
    setup({
      refImg: page({ header: 62, body: 400, footer: 90 }),
      newImg: page({ header: 81, body: 360, footer: 140 }),
      newBody: bounds(81, 360),
      refBounds: { ...bounds(62, 400), mode: "full" },
    }),
  );
  assert.equal(changed.status, 1);
  assert.match(changed.stdout, /BODY HEIGHT 400 vs 360/);
  const missing = run(
    setup({
      refImg: page({ header: 62, body: 400, footer: 90 }),
      newImg: page({ header: 81, body: 400, footer: 140 }),
      newBody: undefined,
      refBounds: { ...bounds(62, 400), mode: "full" },
    }),
  );
  assert.equal(missing.status, 1, missing.stdout);
  assert.match(missing.stdout, /no <main> bounds recorded/);
});

test("CLI: a shot listed under bodyOnly.skip is skipped by name, not silently", () => {
  const r = run(
    setup({
      refImg: page({ header: 62, body: 400, footer: 90 }),
      newImg: page({ header: 81, body: 400, footer: 140, blankBody: true }),
      newBody: bounds(81, 400),
      refBounds: { ...bounds(62, 400), mode: "full" },
      skip: { "shot--desktop.png": "anchored to the header" },
    }),
  );
  assert.equal(r.status, 0, r.stdout);
  assert.match(r.stdout, /SKIP shot--desktop\.png: anchored to the header/);
  assert.match(r.stdout, /1 chrome-anchored shots skipped/);
});

test("without the bounds file the mode is off and the whole image is compared as before", () => {
  const s = setup({
    refImg: page({ header: 62, body: 400, footer: 90 }),
    newImg: page({ header: 81, body: 400, footer: 140 }),
    newBody: bounds(81, 400),
    refBounds: bounds(62, 400),
  });
  const r = spawnSync(
    process.execPath,
    [
      "scripts/compare-visual.cjs",
      s.neu,
      "--ref",
      s.ref,
      "--allow",
      join(s.root, "allow.json"),
      "--body-bounds",
      "none",
      "--mode",
      "structural",
      "--content-root",
      ".",
    ],
    { encoding: "utf8" },
  );
  assert.equal(r.status, 1, "different header/footer heights differ as whole images");
  assert.doesNotMatch(r.stdout, /body-region comparison/);
});

test("cleanup", () => rmSync(tmp, { recursive: true, force: true }));
