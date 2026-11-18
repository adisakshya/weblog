# weblog

✒ The blog of [Adisakshya Chauhan](https://adisakshya.github.io/) — <https://adisakshya.github.io/weblog/>

A fully prerendered static site (TanStack Start + Vite + React) published to GitHub Pages under `/weblog/`.
Articles are Markdown in `_posts/`, pages in `_pages/`. Architecture notes: [`docs/redesign/README.md`](docs/redesign/README.md).

## Develop

Requires Node 22+ and [Bun](https://bun.sh) 1.4.

```sh
bun install --frozen-lockfile
bun run dev        # http://localhost:3000/weblog/
bun run build      # static artifact in dist/client (+ 404.html)
bun run preview    # serve dist/client like GitHub Pages at http://127.0.0.1:4300/weblog/
```

## Check

```sh
bun run typecheck && bun run lint && bun run test
python3 tests/test_legacy_inventory.py          # original content byte-identical to the legacy baseline
node scripts/check-dist.mjs                     # every legacy public route exists in the build
node --test tests/e2e/static-site.test.mjs      # browser checks (run `bunx playwright install chromium` once)
```

The previous Jekyll site is preserved in git history (baseline `e812fd4`).
