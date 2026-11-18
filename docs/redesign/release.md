# Release, rollback and resume

## How the site is published
`.github/workflows/deploy.yml` runs on every push to `master` (and manually). It builds the exact commit, runs the **same checks as CI** (typecheck, lint, unit, content preservation, route manifest, feeds, content fidelity, Chromium suites), and only then uploads `dist/client` (the built site only) to GitHub Pages. A final job runs `scripts/live-check.mjs` against `https://adisakshya.github.io` (retrying while the CDN propagates).

Required repository setting: **Settings → Pages → Build and deployment → Source: GitHub Actions** (already set by the owner). The workflow cannot change it.

Permissions: the build job has `contents: read` only; `pages: write` and `id-token: write` exist only on the deploy job; actions are first-party (`actions/*`) pinned by major tag.

## Verify a release by hand
```sh
node scripts/live-check.mjs https://adisakshya.github.io
```
It checks every public route (200 + its own content), the real 404, the 301 to the slash form, legacy image URLs, ten curated covers are real JPEGs, feeds, every sitemap URL, all home-page scripts/styles, and that development files (the Jekyll site used to serve `/weblog/Gemfile`) are not published.

## Roll back
Preserved reference: branch **`legacy/jekyll-e812fd4`** (commit `e812fd40751c11b34b3ee9d8a4cba9c8ca5f2206`) = the last Jekyll production state. (A tag was preferred but tag pushes are blocked in the build sandbox; the branch must not be deleted or advanced.)

1. **Roll forward to a previous good revision of the new site** (preferred, ~3 minutes): *Actions → Deploy to GitHub Pages → Run workflow*, set `ref` to the previous good commit SHA. It rebuilds, re-checks and redeploys that commit.
2. **Revert the change**: `git revert -m 1 <merge commit>` on `master` and push; the deploy workflow publishes the result.
3. **Back to the legacy Jekyll site** (only if the React site must be abandoned): revert the redesign merge on `master` (or restore `legacy/jekyll-e812fd4` in a new branch/PR), then set *Settings → Pages → Source* back to **Deploy from a branch → master / (root)**. The legacy site is built by GitHub Pages' Jekyll from the restored files. Note the Jekyll site needs Ruby ≤ 3.1 locally (issue #48), which does not affect Pages' own builder.

## Resume / continue (run ledger)
`WEBLOG_RUN_LEDGER.md` (on `redesign/weblog-static`) records scope, decisions, review rounds, last state and next action. A second writer must read it first and must not push to a branch that has an open PR from another session.
