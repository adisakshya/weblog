// The CI visual gate (structural mode, default thresholds) must reject gross regressions and tolerate rendering noise.
// Fixtures are derived from ALL committed approved screenshots, so the guarantee holds for every page/width/theme.
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { join } from "node:path";

const allow = JSON.parse(readFileSync("docs/redesign/visual-allowlist.json", "utf8")).allow;

const require = createRequire(import.meta.url);
const { PNG } = require("pngjs");
const { compareImages } = require("../scripts/compare-visual.cjs");

const dir = "reference/screenshots";
const files = readdirSync(dir)
  .filter((f) => f.endsWith(".png"))
  .sort();
const load = (f) => PNG.sync.read(readFileSync(join(dir, f)));
const clone = (p) => {
  const c = new PNG({ width: p.width, height: p.height });
  p.data.copy(c.data);
  return c;
};
const bgOf = (p) => [p.data[0], p.data[1], p.data[2]]; // top-left pixel = page background
const fill = (p, y0, y1, [r, g, b]) => {
  for (let y = y0; y < y1; y++)
    for (let x = 0; x < p.width; x++) {
      const i = (y * p.width + x) * 4;
      p.data[i] = r;
      p.data[i + 1] = g;
      p.data[i + 2] = b;
    }
  return p;
};
const shiftDown = (p, n) => {
  const c = clone(p);
  fill(c, 0, n, bgOf(p));
  for (let y = n; y < p.height; y++)
    p.data.copy(c.data, y * p.width * 4, (y - n) * p.width * 4, (y - n + 1) * p.width * 4);
  return c;
};
const shiftRight = (p, n) => {
  const c = clone(p);
  for (let y = 0; y < p.height; y++)
    for (let x = n; x < p.width; x++) {
      const s = (y * p.width + x - n) * 4,
        d = (y * p.width + x) * 4;
      p.data.copy(c.data, d, s, s + 4);
    }
  return c;
};
const noise = (p) => {
  const c = clone(p);
  let s = 12345;
  const rnd = () => (s = (s * 1664525 + 1013904223) >>> 0) / 2 ** 32;
  for (let i = 0; i < c.data.length; i += 4)
    if (rnd() < 0.4)
      for (let k = 0; k < 3; k++)
        c.data[i + k] = Math.max(0, Math.min(255, c.data[i + k] + Math.round((rnd() - 0.5) * 12)));
  return c;
};
const blurX = (p) => {
  const c = clone(p);
  for (let y = 0; y < p.height; y++)
    for (let x = 1; x < p.width; x++)
      for (let k = 0; k < 3; k++) {
        const i = (y * p.width + x) * 4 + k;
        c.data[i] = (p.data[i] + p.data[i - 4]) >> 1;
      }
  return c;
};
const invert = (p) => {
  const c = clone(p);
  for (let i = 0; i < c.data.length; i += 4)
    for (let k = 0; k < 3; k++) c.data[i + k] = 255 - c.data[i + k];
  return c;
};

// exactly what CI runs: structural mode, default thresholds, plus the per-shot allowances from the committed allowlist
const ci = (a, b, f) => compareImages(a, b, { mode: "structural", env: {}, rule: allow[f] ?? {} });
const worst = { mustFail: { v: 1, f: "" }, mustPass: { v: 0, f: "" } };
const note = (kind, v, f) => {
  const w = worst[kind];
  if (kind === "mustFail" ? v < w.v : v > w.v) {
    w.v = v;
    w.f = f;
  }
};

describe("structural gate under the CI configuration", () => {
  const mustFail = {
    "blank white page": (p) => fill(clone(p), 0, p.height, [255, 255, 255]),
    "all content erased (page background only)": (p) => fill(clone(p), 0, p.height, bgOf(p)),
    "everything below the header erased (missing sections)": (p) =>
      fill(clone(p), Math.floor(p.height * 0.2), p.height, bgOf(p)),
    "wrong theme (inverted colours)": invert,
    "layout shifted 24px": (p) => shiftDown(p, 24),
  };
  const mustPass = {
    identical: (p) => clone(p),
    "random +-6 noise on 40% of pixels": noise,
    "1px horizontal shift": (p) => shiftRight(p, 1),
    "horizontal 2-pixel blur (hinting/AA-like)": blurX,
  };
  for (const [name, mutate] of Object.entries(mustFail)) {
    it(`REJECTS: ${name} (all ${files.length} shots)`, () => {
      for (const f of files) {
        const ref = load(f);
        const r = ci(ref, mutate(ref), f);
        assert.equal(r.ok, false, `${f}: accepted a "${name}" regression (${r.detail})`);
        note("mustFail", r.metric.fraction, `${f} / ${name}`);
      }
    });
  }
  for (const [name, mutate] of Object.entries(mustPass)) {
    it(`ACCEPTS: ${name} (all ${files.length} shots)`, () => {
      for (const f of files) {
        const ref = load(f);
        const r = ci(ref, mutate(ref), f);
        assert.equal(r.ok, true, `${f}: rejected harmless "${name}" (${r.detail})`);
        note("mustPass", r.metric.fraction, `${f} / ${name}`);
      }
    });
  }
  it("margin report", () => {
    console.log(
      `# smallest bad-block fraction among rejected regressions: ${(worst.mustFail.v * 100).toFixed(3)}% (${worst.mustFail.f}); largest among accepted noise: ${(worst.mustPass.v * 100).toFixed(3)}% (${worst.mustPass.f}); limit 0.500%`,
    );
    assert.ok(
      worst.mustFail.v > worst.mustPass.v * 2,
      "the gate needs a clear margin between regressions and noise",
    );
  });
});
