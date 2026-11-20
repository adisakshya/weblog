# Static redesign — architecture (the final handoff is `WEBLOG_DELIVERY.md`)

The weblog is a fully prerendered static site built with **TanStack Start + Vite + React**, published to GitHub Pages at `https://adisakshya.github.io/weblog/`.
It reproduces the approved Lovable design (`reference/`). Markdown in `_posts/`, `_pages/` stays the authoring path.

## Why this implementation
The approved design already exists as React components. Reusing them keeps visual and interaction fidelity (12 themes, search, series navigation, curated sections) with the smallest change, instead of re-implementing it in another generator. Jekyll's theme layer (`_layouts`, `_includes`, `_sass`, `_config.yml`, `Gemfile`) is removed; authored content is untouched.

## Static build (issue #55)
- `vite.config.ts`: `base: "/weblog/"`, `tanstackStart({ prerender })`. The router uses `basepath: "/weblog"` (`src/router.tsx`).
- `bun run build` → `dist/client` = the GitHub Pages artifact. Articles are real files at their historical paths (`2022/07/16/…ateway….html`); pages are `<route>/index.html`.
- `scripts/postbuild.mjs` renders a real `404.html` from the server bundle and writes `.nojekyll`.
- **Prerender pitfall (fixed):** the crawler discovered `/?view=index` and `/?view=subjects`; a query string cannot change the output file, so the last one overwrote the Posts home page. Query variants are filtered out (`prerender.filter`) and `tests/e2e` asserts that `index.html` is the Posts view.
- `scripts/serve-dist.mjs` serves `dist/client` like GitHub Pages (301 to trailing slash, `404.html` with status 404, nothing outside `/weblog/`).

## Checks
`bun run typecheck && bun run lint && bun run test` · `python3 tests/test_legacy_inventory.py` (authored content byte-identical to `e812fd4`) · `bun run build && node scripts/check-dist.mjs` (every legacy route present) · `bun run test:e2e` (browser: routes, search, appearance + WCAG contrast of all 12 themes, keyboard/a11y, overflow at 5 widths, home views, article features, link integrity) · `bun run visual` (50 shots vs the approved reference).

## Intentional removals (see `docs/inventory/intentional-removals.json`)
Old Jekyll theme assets `/assets/css/dark.css`, `/assets/js/{main.min,sayings,theme-selector}.js` (not authored content). Comments UI and Staticman are omitted; `_data/comments/` is kept unrendered. Analytics are omitted (#65).

## Body-region comparison (#74, #76)
The header (masthead, Meet Adi, Search, Appearance) and the footer (Follow Adi, grouped links) were redesigned on purpose against the
approved Lovable design (project `a72cd5b7`, revision `38e6990`), but `reference/screenshots` still shows the previous chrome, and every
shot contains it. The reference is never regenerated from this implementation, so until it is re-captured from the new Lovable design:

- every shot is compared on its `<main>` region only (`docs/redesign/visual-allowlist.json` → `bodyOnly`); the reference `<main>` bounds
  are in `docs/redesign/visual-reference-body.json`, measured by `scripts/capture-visual.cjs` on commit `6f5e1f0`, the build that matched the
  reference exactly (the reference images are untouched); the new capture records its own bounds in `capture-log.json`;
- the comparison is the tolerant structural one even when `exact` is asked for: the reference body sits at a fractional offset below the
  old header (e.g. 97.78px), so a body under a differently sized header is rasterised at another sub-pixel phase and pixel-exact
  comparison is meaningless. Blank, erased or missing bodies still fail (`tests/visual-body.test.mjs`); a body that ends inside the screenshot must keep its height, and a body that runs to the screenshot edge in one shot but ends early in the other (truncated or grown) fails, so only the rows the screenshot itself cuts off are ignored;
- the four search-dialog / Appearance-panel shots are anchored to the redesigned header and are skipped by name; they are covered by the
  browser tests (`reading-controls`, `search`, `header-footer`, `pinned-header`), which also verify the header and footer themselves;
- the two not-found shots (`not-found--desktop.png`, `not-found--mobile.png`) are skipped by name: the 404 page was redesigned on purpose in #87 (it is now inside the site shell, with the आदि mark and a new heading) and the reference is the old bare page. This is a route-scoped exception, not a threshold change; `tests/e2e/brand-404.test.mjs` covers the page instead. When the reference is re-captured, remove both entries;
- the home page on mobile has a measured allowance (long, text-heavy page; rows one pixel apart because of that sub-pixel phase).

To return to whole-page comparison, re-capture `reference/screenshots` from the new Lovable design (never from this site), then remove
`bodyOnly` from the allowlist and delete `visual-reference-body.json`.

