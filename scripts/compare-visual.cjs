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
const MIN_BODY_ROWS = 300;

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

/** Current content of the working tree, in the shape of docs/redesign/visual-baseline.json. */
function currentContent(root = ".") {
  const ls = (dir) =>
    fs.existsSync(path.join(root, dir))
      ? fs
          .readdirSync(path.join(root, dir))
          .filter((f) => f.endsWith(".md"))
          .sort()
      : [];
  const curated = JSON.parse(
    fs.readFileSync(path.join(root, "_data/curated-content.json"), "utf8"),
  );
  return {
    posts: ls("_posts"),
    tagPages: ls("_pages/tags"),
    seriesPages: ls("_pages/series"),
    books: curated.books.map((b) => b.id),
    videos: curated.videos.map((v) => v.id),
  };
}

/** The rows of `png` from `top` for `rows` lines, as a new image. */
function cropRows(png, top, rows) {
  const out = new PNG({ width: png.width, height: rows });
  PNG.bitblt(png, out, 0, top, png.width, rows, 0, 0);
  return out;
}

/** Body-region comparison: when the header/footer chrome was changed on purpose, compare only the page body (<main>).
 *  `refB` / `newB` are the <main> bounds (page coordinates) recorded for the reference shot and the new shot.
 *  A body that ends INSIDE the screenshot must end inside it in both shots and have the same height (otherwise content was lost
 *  or added); a body that runs to the screenshot boundary (viewport and clipped shots) is cut by the screenshot, so the rows both
 *  shots show are compared. A body that fills one screenshot and ends early in the other was truncated (or grown): an error.
 *  Returns { ref, new } cropped to the same size, or { error }. */
function cropBodies(refImg, newImg, refB, newB) {
  if (!refB || newB === undefined)
    return {
      error: "no <main> bounds recorded (capture log or reference bounds are missing this shot)",
    };
  // A page without the site shell (the 404 page) has no <main>, no header and no footer: compare it whole, but only if both agree.
  if (refB.chromeless || newB === null) {
    return refB.chromeless && newB === null
      ? { ref: refImg, new: newImg }
      : { error: "the page has the site shell in only one of reference and new" };
  }
  const rows = (b, img) => Math.min(b.bottom, img.height) - b.top;
  const rr = rows(refB, refImg),
    nr = rows(newB, newImg);
  if (rr <= 0 || nr <= 0) return { error: `empty body region (${rr} / ${nr} rows)` };
  if (refImg.width !== newImg.width) return { error: `WIDTH ${refImg.width} vs ${newImg.width}` };
  // 2px of slack for sub-pixel rounding of the recorded bottom edge.
  const fills = (b, img) => b.bottom >= img.height - 2;
  const rf = fills(refB, refImg),
    nf = fills(newB, newImg);
  if (rf !== nf)
    return {
      error: `BODY HEIGHT ${rr} vs ${nr} rows: the body ends inside the screenshot in only one of reference and new (truncated or grown)`,
    };
  if (!rf && rr !== nr) return { error: `BODY HEIGHT ${rr} vs ${nr} rows` };
  const n = Math.min(rr, nr);
  if (n < MIN_BODY_ROWS) return { error: `only ${n} shared body rows (< ${MIN_BODY_ROWS})` };
  return { ref: cropRows(refImg, refB.top, n), new: cropRows(newImg, newB.top, n) };
}

/** Content added since the approved reference, or null when the tree is not a pure superset of the baseline.
 *  Anything REMOVED or renamed from the baseline returns null: such a change must never relax the visual gate. */
function contentAdditions(baseline, current) {
  const added = {};
  let any = false;
  for (const key of ["posts", "tagPages", "seriesPages", "books", "videos"]) {
    const have = new Set(current[key] ?? []);
    if ((baseline[key] ?? []).some((x) => !have.has(x))) return null;
    const extra = [...have].filter((x) => !(baseline[key] ?? []).includes(x));
    if (extra.length) {
      added[key] = extra;
      any = true;
    }
  }
  return any ? added : {};
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
  const requestedMode = arg("--mode", process.env.VISUAL_MODE ?? "exact");
  if (!newDir) {
    console.error(
      "usage: compare-visual.cjs <newDir> [--ref dir] [--allow file] [--out dir] [--mode exact|structural]",
    );
    process.exit(2);
  }
  const allowDoc = fs.existsSync(allowFile) ? JSON.parse(fs.readFileSync(allowFile, "utf8")) : {};
  const allow = allowDoc.allow ?? {};
  // Content-dependent shots (home, tag/series pages, panels over the home page) cannot match a frozen reference once the
  // owner has ADDED an article, tag, series, book or video. They are skipped, by name and loudly, only for a pure addition.
  const baselineFile = arg("--baseline", "docs/redesign/visual-baseline.json");
  let skipPattern = null;
  if (allowDoc.contentDependent && fs.existsSync(baselineFile)) {
    const added = contentAdditions(
      JSON.parse(fs.readFileSync(baselineFile, "utf8")),
      currentContent(arg("--content-root", ".")),
    );
    if (added && Object.keys(added).length) {
      skipPattern = new RegExp(allowDoc.contentDependent.pattern);
      console.log(
        `NOTE content added since the approved reference (${Object.entries(added)
          .map(([k, v]) => `${k}: ${v.join(", ")}`)
          .join("; ")}): content-dependent shots are skipped, all other shots stay mandatory`,
      );
    }
  }
  // Body-region mode (docs/redesign/README.md): active when the allowlist declares `bodyOnly` and the reference <main> bounds exist.
  const boundsFile = arg("--body-bounds", "docs/redesign/visual-reference-body.json");
  const bodyCfg = allowDoc.bodyOnly && fs.existsSync(boundsFile) ? allowDoc.bodyOnly : null;
  const refBounds = bodyCfg ? (JSON.parse(fs.readFileSync(boundsFile, "utf8")).shots ?? {}) : {};
  const newLogFile = path.join(newDir, "capture-log.json");
  const newBounds = {};
  if (bodyCfg && fs.existsSync(newLogFile))
    for (const e of JSON.parse(fs.readFileSync(newLogFile, "utf8")).shots ?? [])
      newBounds[e.file] = e;
  // The reference body sits at a fractional offset below the old header (e.g. 97.78px), so a body under any differently sized
  // header is rasterised at another sub-pixel phase: pixel-exact comparison is meaningless there, the tolerant one is used.
  const mode = bodyCfg ? "structural" : requestedMode;
  if (bodyCfg)
    console.log(
      "NOTE body-region comparison: only the <main> region of each page is compared (header and footer were changed on purpose)",
    );
  let skipped = 0;
  let bodySkipped = 0;
  let failed = 0,
    total = 0;
  for (const f of fs
    .readdirSync(refDir)
    .filter((x) => x.endsWith(".png"))
    .sort()) {
    if (skipPattern && skipPattern.test(f)) {
      skipped++;
      console.log(`SKIP ${f}: depends on content added since the approved reference`);
      continue;
    }
    total++;
    const np = path.join(newDir, f);
    if (!fs.existsSync(np)) {
      console.log(`MISSING ${f}`);
      failed++;
      continue;
    }
    let refImg = PNG.sync.read(fs.readFileSync(path.join(refDir, f)));
    let newImg = PNG.sync.read(fs.readFileSync(np));
    if (bodyCfg) {
      const why = bodyCfg.skip?.[f];
      if (why) {
        bodySkipped++;
        total--;
        console.log(`SKIP ${f}: ${why}`);
        continue;
      }
      const c = cropBodies(
        refImg,
        newImg,
        refBounds[f],
        newBounds[f] ? newBounds[f].body : undefined,
      );
      if (c.error) {
        failed++;
        console.log(`DIFF ${f}: ${c.error}`);
        continue;
      }
      refImg = c.ref;
      newImg = c.new;
    }
    const r = compareImages(refImg, newImg, { mode, rule: allow[f] ?? {} });
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
  console.log(
    `${total - failed}/${total} ${bodyCfg ? "body regions" : "shots"} match the approved reference (${mode})${skipped ? `, ${skipped} content-dependent shots skipped` : ""}${bodySkipped ? `, ${bodySkipped} chrome-anchored shots skipped (see docs/redesign/README.md)` : ""}`,
  );
  process.exit(failed ? 1 : 0);
}

module.exports = {
  compareImages,
  structuralDiff,
  contentAdditions,
  currentContent,
  cropRows,
  cropBodies,
  DEFAULTS,
};
if (require.main === module) main();
