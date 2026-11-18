# Static redesign — architecture (work in progress; final handoff is `WEBLOG_DELIVERY.md`)

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
