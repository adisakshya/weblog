// The visual comparator must pass identical images and FAIL on regressions (so a green run means something).
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";

const { PNG } = createRequire(import.meta.url)("pngjs");

function png(w, h, paint) {
  const p = new PNG({ width: w, height: h });
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      const [r, g, b] = paint(x, y);
      const i = (y * w + x) * 4;
      p.data.set([r, g, b, 255], i);
    }
  return PNG.sync.write(p);
}
const white = () => [255, 255, 255];
const withBlock = (x, y) => (x < 20 && y < 20 ? [0, 0, 0] : [255, 255, 255]); // 400px of 10000 = 4%

function run(ref, nu, { allow, env } = {}) {
  const dir = mkdtempSync(join(tmpdir(), "vc-"));
  const refDir = join(dir, "ref"),
    newDir = join(dir, "new");
  mkdirSync(refDir);
  mkdirSync(newDir);
  for (const [name, buf] of Object.entries(ref)) writeFileSync(join(refDir, name), buf);
  for (const [name, buf] of Object.entries(nu)) writeFileSync(join(newDir, name), buf);
  const allowFile = join(dir, "allow.json");
  writeFileSync(allowFile, JSON.stringify({ allow: allow ?? {} }));
  return spawnSync(
    process.execPath,
    ["scripts/compare-visual.cjs", newDir, "--ref", refDir, "--allow", allowFile],
    {
      encoding: "utf8",
      env: { ...process.env, ...env },
    },
  );
}

describe("compare-visual", () => {
  const base = png(100, 100, white);
  it("passes identical images", () =>
    assert.equal(run({ "a.png": base }, { "a.png": base }).status, 0));
  it("fails when a region changes", () => {
    const r = run({ "a.png": base }, { "a.png": png(100, 100, withBlock) });
    assert.equal(r.status, 1);
    assert.match(r.stdout, /DIFF a\.png/);
  });
  it("fails when a shot is missing", () => {
    const r = run({ "a.png": base }, {});
    assert.equal(r.status, 1);
    assert.match(r.stdout, /MISSING a\.png/);
  });
  it("fails on a size change unless explicitly allowed", () => {
    const bigger = png(100, 120, white);
    assert.equal(run({ "a.png": base }, { "a.png": bigger }).status, 1);
    assert.equal(
      run(
        { "a.png": base },
        { "a.png": bigger },
        { allow: { "a.png": { sizeMayDiffer: true, reason: "test" } } },
      ).status,
      0,
    );
  });
  it("accepts a listed difference only up to its ratio", () => {
    const changed = png(100, 100, withBlock); // 4%
    assert.equal(
      run(
        { "a.png": base },
        { "a.png": changed },
        { allow: { "a.png": { maxRatio: 0.05, reason: "t" } } },
      ).status,
      0,
    );
    assert.equal(
      run(
        { "a.png": base },
        { "a.png": changed },
        { allow: { "a.png": { maxRatio: 0.01, reason: "t" } } },
      ).status,
      1,
    );
  });
  it("an unlisted shot gets the global tolerance only (VISUAL_MAX_RATIO)", () => {
    const changed = png(100, 100, withBlock);
    assert.equal(
      run({ "a.png": base }, { "a.png": changed }, { env: { VISUAL_MAX_RATIO: "0.05" } }).status,
      0,
    );
    assert.equal(
      run({ "a.png": base }, { "a.png": changed }, { env: { VISUAL_MAX_RATIO: "0.01" } }).status,
      1,
    );
  });
});
