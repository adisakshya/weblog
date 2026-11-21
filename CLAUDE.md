# Weblog — Claude Code guide

@AGENTS.md

`AGENTS.md` (imported above) holds the project rules and the code-review rules and is also read by other agents (Codex). This file only adds what is specific to working in this repo with Claude Code. Architecture and the everyday workflow (add a post, curated content) are in `WEBLOG_DELIVERY.md`; the design-contract and visual-gate details are in `docs/redesign/README.md`.

## Commands (Node 22, Bun 1.4.4; `.devcontainer/` sets both up for Codespaces)
```sh
bun install --frozen-lockfile
bun run dev            # http://localhost:5173/weblog/
bun run build          # static site in dist/client (+ 404.html, sitemap, feed); then `bun run preview` → http://127.0.0.1:4300/weblog/
bun run typecheck && bun run lint && bun run test
bun run check:content  # original Markdown/comments/images preserved
bun run test:e2e       # Chromium suites against the built dist/ (build first; `bunx playwright install --with-deps chromium` once)
bun run visual:ci      # structural comparison with the frozen reference
```
CI (`.github/workflows/ci.yml`) runs all of these plus `python3 tests/test_legacy_inventory.py`, `tests/test_feeds.py` and `node scripts/check-dist.mjs`.

## Working rules
- Never edit `_posts/`, `_pages/` or `_data/comments/` prose, and never recapture `reference/screenshots/`.
- An approved visual change is recorded under "Known deviations" in `reference/README.md`, with a scoped exception in `docs/redesign/visual-allowlist.json` only if a gate fails; never loosen a threshold globally.
- Keep one commit per issue on a `followup/<issue>-<slug>` branch and open a PR to `master`. Do not merge or deploy without the owner's explicit say-so; a merge to `master` publishes through `.github/workflows/deploy.yml`, which refuses to deploy if any browser check fails.
- Workflow actions stay pinned to commit SHAs (`tests/workflow-pins.test.mjs`).

## Things that have bitten before
- `bun run test:e2e` runs the files in parallel; each picks a free port (`tests/e2e/helpers.mjs`), so never hard-code one.
- The "extension pack" e2e tests load `res.cloudinary.com` images and fail with `ERR_TUNNEL_CONNECTION_FAILED` in a network-restricted sandbox; they pass in CI.
- `tests/e2e` and the visual gates read the built `dist/`; rebuild after changing source or they test stale output.
- The 404 page must keep the exact text "Page not found" (`scripts/postbuild.mjs`).
