# weblog

✒ The blog of [Adisakshya Chauhan](https://adisakshya.github.io/) — <https://adisakshya.github.io/weblog/>

A fully prerendered static site (TanStack Start + Vite + React) published to GitHub Pages under `/weblog/`.
Articles are Markdown in `_posts/`, pages in `_pages/`. Architecture notes: [`docs/redesign/README.md`](docs/redesign/README.md).

## Develop

Requires Node 22+ and [Bun](https://bun.sh) 1.4.

```sh
bun install --frozen-lockfile
bun run dev        # http://localhost:5173/weblog/
bun run build      # static artifact in dist/client (+ 404.html)
bun run preview    # serve dist/client like GitHub Pages at http://127.0.0.1:4300/weblog/
```

## Develop in GitHub Codespaces

Open the repository on GitHub → **Code** → **Codespaces** → **Create codespace on master**. `.devcontainer/devcontainer.json` gives you Node 22, Bun 1.4.4 (the same pins as CI), Python 3, the dependencies (`bun install --frozen-lockfile`) and Chromium for the browser tests, so nothing needs installing by hand.

```sh
bun run dev        # forwarded port 5173: open it from the Ports tab and go to /weblog/
bun run preview    # after bun run build: forwarded port 4300, the built site served like GitHub Pages
```

If the creation log (**Command Palette → Codespaces: View Creation Log**) shows the Chromium step failing, run `bunx playwright install --with-deps chromium` once before `bun run test:e2e`. The dev server allows the `*.app.github.dev` hostnames Codespaces uses; other hosts are still refused by Vite.

## Check

```sh
bun run typecheck && bun run lint && bun run test
python3 tests/test_legacy_inventory.py          # original content byte-identical to the legacy baseline
node scripts/check-dist.mjs                     # every legacy public route exists in the build
bun run test:e2e                                 # all browser checks (run `bunx playwright install chromium` once)
```

The previous Jekyll site is preserved in git history (baseline `e812fd4`).
