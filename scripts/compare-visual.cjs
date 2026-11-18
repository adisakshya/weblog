#!/usr/bin/env node
/* Compare new-site screenshots with the frozen approved reference (reference/screenshots).
 *   node scripts/compare-visual.cjs <newDir> [--ref dir] [--allow file] [--out diffDir] [--mode exact|structural]
 *
 * exact (default, local acceptance run on the capturing environment): pixelmatch, 0% differing pixels unless a per-shot
 *   allowance says otherwise.
 * structural (CI, a different OS/font stack): compares 16x16 block averages. Anti-aliasing / hinting noise moves a block's
 *   mean by a few percent; erased or moved content, a blank page or a wrong theme moves many blocks by far more. A shot
 *   fails when more than `maxBadBlocks` (fraction) of its blocks differ by more than `blockThreshold` (mean channel diff).
 *
 * Allowances are explicit, per shot, with a reason. Never regenerate the reference from the new implementation. */
const fs = require("fs");
const path = require("path");
const { PNG } = require("pngjs");
const pixelmatch = require("pixelmatch").default ?? require("pixelmatch");

const BLOCK = 16;
const DEFAULTS = { blockThreshold: 0.1, maxBadBlocks: 0.005 };

/** Fraction of BLOCKxBLOCK blocks whose mean colour differs by more than `threshold` (max over RGB channels, 0..1). */
function structuralDiff(a, b, threshold = DEFAULTS.blockThreshold) {
  const bw = Math.ceil(a.width / BLOCK),
    bh = Math.ceil(a.height / BLOCK);
  let bad = 0,
    max = 0;
  for (let by = 0; by < bh; by++)
    for (let bx = 0; bx < bw; bx++) {
      const sa = [0, 0, 0],
        sb = [0, 0, 0];
      let n = 0;
      for (let y = by * BLOCK; y < Math.min(a.height, (by + 1) * BLOCK); y++)
        for (let x = bx * BLOCK; x < Math.min(a.width, (bx + 1) * BLOCK); x++) {
          const i = (y * a.width + x) * 4;
          for (let c = 0; c < 3; c++) {
            sa[c] += a.data[i + c];
            sb[c] += b.data[i + c];
          }
          n++;
        }
      const d = Math.max(...[0, 1, 2].map((c) => Math.abs(sa[c] - sb[c]) / n / 255));
      if (d > threshold) bad++;
      if (d > max) max = d;
    }
  return { bad, total: bw * bh, fraction: bad / (bw * bh), max };
}

/** Decide one shot. Returns { ok, detail, sizeMismatch }. */
function compareImages(a, b, { mode = "exact", rule = {}, env = process.env } = {}) {
  if (a.width !== b.width || a.height !== b.height) {
    if (rule.sizeMayDiffer)
      return {
        ok: true,
        detail: `size ${a.width}x${a.height} -> ${b.width}x${b.height} (allowed: ${rule.reason})`,
      };
    return { ok: false, detail: `SIZE ${a.width}x${a.height} vs ${b.width}x${b.height}` };
  }
  if (mode === "structural") {
    const threshold =
      rule.blockThreshold ?? Number(env.VISUAL_BLOCK_THRESHOLD ?? DEFAULTS.blockThreshold);
    const allowed = rule.maxBadBlocks ?? Number(env.VISUAL_MAX_BAD_BLOCKS ?? DEFAULTS.maxBadBlocks);
    const s = structuralDiff(a, b, threshold);
    const note = `${(s.fraction * 100).toFixed(3)}% blocks differ >${(threshold * 100).toFixed(0)}% (max ${(s.max * 100).toFixed(1)}%)`;
    return s.fraction > allowed
      ? { ok: false, detail: `${note} > ${(allowed * 100).toFixed(3)}%`, metric: s }
      : { ok: true, detail: note, metric: s, quiet: s.bad === 0 };
  }
  const diff = new PNG({ width: a.width, height: a.height });
  const n = pixelmatch(a.data, b.data, diff.data, a.width, a.height, { threshold: 0.1 });
  const ratio = n / (a.width * a.height);
  const max = Math.max(rule.maxRatio ?? 0, Number(env.VISUAL_MAX_RATIO ?? 0));
  const note = `${(ratio * 100).toFixed(3)}% (${n}px)`;
  return ratio > max
    ? { ok: false, detail: `${note} > ${(max * 100).toFixed(3)}%`, diff }
    : { ok: true, detail: note, quiet: n === 0 };
}

function main() {
  const arg = (name, dflt) => {
    const i = process.argv.indexOf(name);
    return i > -1 ? process.argv[i + 1] : dflt;
  };
  const newDir = process.argv[2];
  const refDir = arg("--ref", "reference/screenshots");
  const allowFile = arg("--allow", "docs/redesign/visual-allowlist.json");
  const outDir = arg("--out", null);
  const mode = arg("--mode", process.env.VISUAL_MODE ?? "exact");
  if (!newDir) {
    console.error(
      "usage: compare-visual.cjs <newDir> [--ref dir] [--allow file] [--out dir] [--mode exact|structural]",
    );
    process.exit(2);
  }
  const allow = fs.existsSync(allowFile)
    ? (JSON.parse(fs.readFileSync(allowFile, "utf8")).allow ?? {})
    : {};
  let failed = 0,
    total = 0;
  for (const f of fs
    .readdirSync(refDir)
    .filter((x) => x.endsWith(".png"))
    .sort()) {
    total++;
    const np = path.join(newDir, f);
    if (!fs.existsSync(np)) {
      console.log(`MISSING ${f}`);
      failed++;
      continue;
    }
    const r = compareImages(
      PNG.sync.read(fs.readFileSync(path.join(refDir, f))),
      PNG.sync.read(fs.readFileSync(np)),
      { mode, rule: allow[f] ?? {} },
    );
    if (!r.ok) {
      failed++;
      console.log(`DIFF ${f}: ${r.detail}`);
      if (outDir && r.diff) {
        fs.mkdirSync(outDir, { recursive: true });
        fs.writeFileSync(path.join(outDir, f), PNG.sync.write(r.diff));
      }
    } else if (!r.quiet)
      console.log(`ok   ${f}: ${r.detail}${allow[f] ? ` (allowed: ${allow[f].reason})` : ""}`);
  }
  console.log(`${total - failed}/${total} shots match the approved reference (${mode})`);
  process.exit(failed ? 1 : 0);
}

module.exports = { compareImages, structuralDiff, DEFAULTS };
if (require.main === module) main();
