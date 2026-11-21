// The आदि mark without a tile (brand spec: docs/brand/README.md): the word in the current text colour plus the vermilion point.
// The approved adi-mark.svg is inlined exactly as committed (outlined paths, no web font); its glyph is `currentColor`, so the
// wrapper's CSS colour (--j-fg) paints it, and the SVG's own role="img" / aria-label="Adi" name it for assistive technology.
import markSvg from "../../../docs/brand/assets/adi-mark.svg?raw";

export function AdiMark({ className = "" }: { className?: string }) {
  return (
    <span
      className={`adi-mark ${className}`.trim()}
      dangerouslySetInnerHTML={{ __html: markSvg }}
    />
  );
}
