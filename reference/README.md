# Approved design reference (issue #54)

Frozen, independently captured reference for the redesign. **Never recapture these from the new implementation to make a check pass.**

| Item | Value |
|---|---|
| Lovable project | `c12696b6-7bda-47a8-8126-ef17c1071df6` |
| Approved revision | `df8c3ddff9f6f4a182f1a8dc41c729b7d4a5d988` (still the latest commit at capture time, 18 Nov 2026) |
| Source export | ZIP sha256 `00bea465382285b73b2ab3d17b76c1590ff0ebce35a61765dac4cf4959abaeea` (259 entries) |
| Full source snapshot | branch `reference/lovable-df8c3dd`, directory `lovable-export/` (kept off the production tree) |
| Legacy baseline | `master` @ `e812fd40751c11b34b3ee9d8a4cba9c8ca5f2206` (fixtures in `docs/inventory/`) |

## Screenshots (`reference/screenshots/`)
Captured by `scripts/capture-visual.cjs` from the export's own `vite dev` server (its Cloudflare build cannot be run with `vite preview`), Chromium, 1440×900 and 390×844, reduced motion, covers served from `reference/covers/`.
50 images: 11 routes × 2 widths (home Posts/Index/Subjects, 3 articles — top 1800px —, tag, series, contact, terms, 404), the open Search and Appearance panels, and the article page in all 12 themes × 2 widths. `capture-log.json` lists each shot.
Re-run the same script against the new site and compare with `scripts/compare-visual.cjs` (issue #60).

## Recovered curated covers (`reference/covers/`)
The export holds only `*.jpg.asset.json` pointers for the ten Bookshelf/Worth-watching images. They were recovered from the preview origin plus each pointer URL.
Each file is a real JPEG (magic bytes, dimensions parsed) whose byte length equals the pointer's `size`. `verification.json` records a second check against the original source URL in `asset-sources.json`: 7/10 are byte-identical; the three on `covers.openlibrary.org` (×2) and `www.gutenberg.org` were not reachable from the build sandbox, so for those only the pointer size/format match is established.
`SHA256SUMS` pins the bytes. Production copies are shipped under a stable `/weblog/` path by issue #56.

## Known deviations from the reference
Recorded as they are decided: comments omitted; analytics omitted (#65); Beyond the blog removed (already absent from the approved revision).

### आदि brand (#82, owner-approved 21 November 2026)
These are approved deviations from the frozen reference. `reference/screenshots/` is never recaptured; where a visual gate is affected, the exception is scoped to the route or region and documented in `docs/redesign/README.md`.
- **#83 header.** The masthead reads "Adisakshya Chauhan" (the reference says "The blog of Adisakshya Chauhan"), in the same per-breakpoint faces. Once the header condenses the आदि seal replaces the name in the same box (tilted −3°, crossfade ≤ 150 ms, none under `prefers-reduced-motion`); the name and the seal never show together. The condensed height, `--j-header-h` and the 64 / 8 px thresholds are unchanged. The seal takes the theme's colours (tile = `--j-fg`, glyph = `--j-bg`, point `#E2452F`); in Dune and Deep Sea only the tile is overridden (`#1f2a30` / `#edf3f4`) because the point would otherwise be 2.74:1 and 2.995:1 against it (owner decision, option B).
- **#86 footer and end-mark.** A 44 px seal (no tilt, `aria-hidden`) sits left of the "© year Adisakshya Chauhan" line (the row was already 44 px tall, so the footer's height is unchanged). Every post ends with one vermilion point (`#E2452F`, `role="img"`, `aria-label="End of article"`) added at render time after the last word (on its own line after a code block, image or video); the Markdown is untouched and no other page has one.
- **#84 site title.** The site name is "Adisakshya Chauhan" (the reference and the previous build say "The blog of Adisakshya Chauhan"): home `<title>`, `og:site_name`, home `og:title`, the screen-reader `<h1>`, the feed `<link rel="alternate">` title and the Atom `<title>`. Post, series, tag, About, Contact and Terms titles read "{page title} — Adisakshya Chauhan" (em dash instead of " - The blog of …"). Descriptions are unchanged. The feed differs from the previous build in that one `<title>` line only: the feed `<id>`, every entry `<id>`, link and date, and `sitemap.xml` are byte-identical.
- **#85 favicon and share image.** `public/` ships the approved आदि set unchanged from `docs/brand/assets` (`favicon.ico` 16/32/48 replaces the old one, `favicon.svg`, `apple-touch-icon.png`, `favicon-192.png`, `favicon-512.png`) and the default `og-image.png` (1200×630, no tagline); the head links the SVG, the ICO fallback and the Apple touch icon. Every content route (home, About, Contact, Terms, tag and series pages) now sets an absolute `og:image` / `twitter:image` (+ size and alt) of its own, and posts without an image of their own fall back to it; posts that have one keep it. The root layout adds none (the not-found page has none). Tag, series, About, Contact and Terms use the large Twitter card because the image is 1200×630.
