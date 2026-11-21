// The आदि seal (brand spec: docs/brand/README.md). The approved SVG is inlined exactly as committed (outlined paths, so no
// Devanagari web font is loaded and nothing is redrawn); only the page's CSS decides its colours, through three custom
// properties that the SVG reads: --adi-tile (the rounded square), --adi-glyph (the word) and --adi-point (the vermilion point).
// The theme mapping lives in `.adi-seal` in src/styles/journal.css.
import sealSvg from "../../../docs/brand/assets/adi-seal-themeable.svg?raw";

type Props = {
  className?: string;
  /** Native hover tooltip. The seal itself is always hidden from assistive technology; name the surrounding link instead. */
  title?: string;
};

export function AdiSeal({ className = "", title = "Adi" }: Props) {
  return (
    <span
      aria-hidden="true"
      title={title}
      className={`adi-seal ${className}`.trim()}
      dangerouslySetInnerHTML={{ __html: sealSvg }}
    />
  );
}
