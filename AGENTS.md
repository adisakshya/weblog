# AGENTS.md

Review checklist for Codex passes over work Claude has already completed in this repo. **Read `CLAUDE.md` first** — it is the source of truth for architecture, build commands, and content conventions. This file does not repeat it; it only defines what a review pass does and where its authority ends.

## Scope of review

You are auditing, not authoring. Verify that the diff (and any claims made about it in `CLAUDE.md`/`README.md`) matches actual repo state — don't re-derive documentation or conventions from scratch, and don't second-guess conventions `CLAUDE.md` already documents as intentional (e.g. hardcoded `/weblog/` in specific files, the Staticman endpoint, the lack of a main nav).

Check specifically:
- `Gemfile`/`Gemfile.lock` match what's actually required — no silent version bumps.
- `_config.yml` values (theme ref, plugins, url/baseurl, comments provider) are unchanged unless the task called for it.
- Front matter on touched posts/pages is valid and complete per `CLAUDE.md`'s "Adding a blog post" / taxonomy conventions.
- Liquid syntax (`{% %}` / `{{ }}` balance) in any touched template/include.
- Internal links and asset paths actually resolve under `/weblog`.
- Tag/category casing and slugs match the existing taxonomy list — no near-duplicate variants introduced.

## Auto-fix vs. escalate

**Auto-fix silently** (small, mechanical, unambiguous):
- Broken internal links (wrong path, missing `/weblog` prefix, stale anchor).
- Invalid YAML front matter (bad indentation, missing quotes, tabs).
- Inconsistent tag/category casing or slug variants of an already-existing tag.
- Dead/broken asset references (typo'd filename, wrong extension) where the correct target is unambiguous.

**Escalate to the human instead of touching it:**
- Any change to deployment config (`url`, `baseurl`, GitHub Pages branch/source, `remote_theme` version).
- Any navigation change (footer links, main nav, author-profile links).
- Any edit to `staticman.yml` or the comments provider/endpoint config in `_config.yml`.
- Any content/wording change to an already-published post (typo fixes in a *new*, unpublished change are fine; rewriting published prose is not).
- Anything not already covered by an explicit rule in `CLAUDE.md`.

When in doubt, escalate — do not guess at intent.

## Required checks before approving

- [ ] `bundle exec jekyll build` succeeds (or the exact command + error is reported if the environment can't run it — see `CLAUDE.md`'s Ruby-version caveat).
- [ ] No files outside the stated task's scope were touched.
- [ ] No generated output (`_site/`, `.jekyll-cache/`, `.sass-cache/`) is committed.
- [ ] No gem/dependency version changes unless explicitly requested.
- [ ] Every link/asset reference preserves the `/weblog` base path (via `relative_url`/`site.baseurl`, or the repo's existing hardcoded-`/weblog/` pattern where that's already the established style for that file).

## Output format

Every review reports, in this order:

1. **Checks** — pass/fail for each item in "Required checks above."
2. **Auto-fixes applied** — list each one with file + one-line reason.
3. **Escalated for human review** — list each item that needs a decision, with file + why it wasn't auto-fixed.
4. **Diff summary** — short summary of what changed, file by file.

## Non-goals

- Do not restructure the repo or its conventions.
- Do not rewrite historical posts.
- Do not change the theme, its version, or the plugin list.
- Do not act on anything not already specified in `CLAUDE.md` — if it's not covered there, escalate instead of deciding on your own.
