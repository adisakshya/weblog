#!/usr/bin/env node
/* Compare new-site screenshots with the frozen approved reference (reference/screenshots).
 *   node scripts/compare-visual.cjs <newDir> [--ref reference/screenshots] [--allow docs/redesign/visual-allowlist.json] [--out diffDir]
 * Fails when any shot differs by more than its allowed ratio. Allowances are explicit, per shot, with a reason;
 * never regenerate the reference from the new implementation to make this pass. */
const fs = require("fs");
const path = require("path");
const { PNG } = require("pngjs");
const pixelmatch = require("pixelmatch").default ?? require("pixelmatch");

const arg = (name, dflt) => {
  const i = process.argv.indexOf(name);
  return i > -1 ? process.argv[i + 1] : dflt;
};
const newDir = process.argv[2];
const refDir = arg("--ref", "reference/screenshots");
const allowFile = arg("--allow", "docs/redesign/visual-allowlist.json");
const outDir = arg("--out", null);
if (!newDir) {
  console.error("usage: compare-visual.cjs <newDir> [--ref dir] [--allow file] [--out dir]");
  process.exit(2);
}
const allow = fs.existsSync(allowFile)
  ? (JSON.parse(fs.readFileSync(allowFile, "utf8")).allow ?? {})
  : {};
// Local acceptance run: identical rendering expected (same Chromium, fonts, content) => 0.
// CI uses a different Chromium build, so it sets VISUAL_MAX_RATIO (e.g. 0.01) to catch layout regressions, not anti-aliasing.
const DEFAULT_MAX_RATIO = Number(process.env.VISUAL_MAX_RATIO ?? 0);

let failed = 0,
  total = 0;
for (const f of fs
  .readdirSync(refDir)
  .filter((x) => x.endsWith(".png"))
  .sort()) {
  total++;
  const a = PNG.sync.read(fs.readFileSync(path.join(refDir, f)));
  const np = path.join(newDir, f);
  if (!fs.existsSync(np)) {
    console.log(`MISSING ${f}`);
    failed++;
    continue;
  }
  const b = PNG.sync.read(fs.readFileSync(np));
  const rule = allow[f] ?? {};
  if (a.width !== b.width || a.height !== b.height) {
    if (rule.sizeMayDiffer) {
      console.log(
        `ok (size ${a.width}x${a.height} -> ${b.width}x${b.height}, allowed: ${rule.reason})`.padEnd(
          8,
        ) + ` ${f}`,
      );
      continue;
    }
    console.log(`SIZE ${f}: ${a.width}x${a.height} vs ${b.width}x${b.height}`);
    failed++;
    continue;
  }
  const diff = new PNG({ width: a.width, height: a.height });
  const n = pixelmatch(a.data, b.data, diff.data, a.width, a.height, { threshold: 0.1 });
  const ratio = n / (a.width * a.height);
  const max = Math.max(rule.maxRatio ?? 0, DEFAULT_MAX_RATIO);
  if (ratio > max) {
    failed++;
    console.log(`DIFF ${f}: ${(ratio * 100).toFixed(3)}% (${n}px) > ${(max * 100).toFixed(3)}%`);
    if (outDir) {
      fs.mkdirSync(outDir, { recursive: true });
      fs.writeFileSync(path.join(outDir, f), PNG.sync.write(diff));
    }
  } else if (n) console.log(`ok   ${f}: ${(ratio * 100).toFixed(3)}% (allowed: ${rule.reason})`);
}
console.log(`${total - failed}/${total} shots match the approved reference`);
process.exit(failed ? 1 : 0);
