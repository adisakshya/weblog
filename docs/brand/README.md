# आदि brand — source of truth (#82)

Owner-approved on 21 November 2026 (Asia/Kolkata). Implementation issues: #83 header, #84 site title, #85 favicon + share image, #86 footer seal + end-mark, #87 404.

## The mark
- **आदि** ("Adi") set in Tiro Devanagari Hindi, followed by a filled **point** in vermilion `#E2452F` (≈0.16em, gap ≈0.05em, sitting on the baseline).
- **Seal** = the mark centred (by its outline bounding box) in a rounded square (radius 17% of the side).
- Favicon uses the simplified **आ** + point; the full word is illegible at 16px.
- Wordmark (share image only): "adisakshya" in Newsreader 500 (opsz 72) + point.

## Colour
| Token | Value | Use |
|---|---|---|
| Ink | `#1A1A1A` | tile on light backgrounds (static files) |
| Paper | `#F7F5F0` | tile on dark backgrounds (static files) |
| Vermilion | `#E2452F` | **the point only**, never for site UI |

On the site the seal follows the active theme: `--adi-tile: var(--j-fg)`, `--adi-glyph: var(--j-bg)`, `--adi-point: #E2452F`. The rest of the site keeps its own tokens.

## Placements
| Where | Form | Notes |
|---|---|---|
| Header, top of page | none: the masthead reads "Adisakshya Chauhan" | existing per-breakpoint fonts |
| Header, condensed | seal, rotated −3° | replaces the name; never shown beside it |
| Footer | seal ~44px, no tilt | left of "© {year} Adisakshya Chauhan"; no text about the name |
| Article end | vermilion point only | `role="img"` `aria-label="End of article"` |
| 404 | large mark (glyph = `--j-fg`) | "Back to the beginning." Keep the text "Page not found" |
| Favicon | आ + point, ink tile | ico / svg / png set |
| Social share | `og-image.png` 1200×630 | per route, never at the root; no tagline |

## Files (`assets/`, checksums in `SHA256SUMS`)
- `adi-seal-themeable.svg`: for **inline** use in React; colours read `--adi-tile`, `--adi-glyph` and `--adi-point`, with light fallbacks.
- `adi-seal-light.svg` / `adi-seal-dark.svg`: fixed-colour seals for use outside the site.
- `adi-mark.svg`: mark without a tile; glyph `currentColor`, point vermilion.
- `favicon.ico` (16/32/48), `favicon.svg`, `favicon-16/32/48/192/512.png`, `apple-touch-icon.png` (180).
- `og-image.svg` / `og-image.png`: default share image.

All glyphs are **outlined paths**, so no Devanagari web font is loaded on the site. Do not hand-edit the SVGs: regenerate them with `build_brand_assets.py` (usage, font sources and checksums are in its docstring). HarfBuzz shaping is required, because Devanagari places the ि vowel sign before द.
