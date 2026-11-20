// The approved brand files (docs/brand/assets, spec in docs/brand/README.md) are used exactly as committed: the inlined seal is the
// file's own markup, and the checksums in SHA256SUMS still describe the files. Nothing here redraws or edits a glyph.
import { createHash } from "node:crypto";
import { readFileSync, readdirSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { AdiSeal } from "./AdiSeal";

const DIR = "docs/brand/assets";
const sha = (f: string) =>
  createHash("sha256")
    .update(readFileSync(`${DIR}/${f}`))
    .digest("hex");

describe("approved brand files", () => {
  it("every file matches its SHA256SUMS entry, and every asset is listed", () => {
    const listed = readFileSync(`${DIR}/SHA256SUMS`, "utf8")
      .trim()
      .split("\n")
      .map((l) => l.split(/\s+/) as [string, string]);
    expect(listed.length).toBeGreaterThanOrEqual(14);
    for (const [hash, file] of listed) expect(sha(file), file).toBe(hash);
    const files = readdirSync(DIR).filter((f) => f !== "SHA256SUMS");
    expect(files.sort()).toEqual(listed.map(([, f]) => f).sort());
  });
});

describe("AdiSeal", () => {
  const html = renderToStaticMarkup(AdiSeal({}) as never);
  const svg = readFileSync(`${DIR}/adi-seal-themeable.svg`, "utf8").trim();
  it("inlines the committed themeable SVG exactly (no <img>, no redrawn geometry)", () => {
    expect(html).toContain(svg);
    expect(html).not.toMatch(/<img/i);
  });
  it("is hidden from assistive technology and carries the Adi tooltip", () => {
    expect(html).toMatch(/^<span aria-hidden="true" title="Adi" class="adi-seal">/);
  });
  it("takes its colours from the --adi-* properties only", () => {
    expect(svg).toContain("var(--adi-tile");
    expect(svg).toContain("var(--adi-glyph");
    expect(svg).toContain("var(--adi-point, #E2452F)");
    expect(svg).not.toMatch(/font-family|<text/);
  });
});
