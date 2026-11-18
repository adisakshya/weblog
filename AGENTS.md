# Weblog — agent and reviewer instructions

Personal weblog of Adisakshya Chauhan, published at `https://adisakshya.github.io/weblog/` (GitHub Pages project site, base path `/weblog/`).
The site is being migrated from Jekyll to a fully prerendered static React site (TanStack Start + Vite) that reproduces the approved Lovable design
(project `c12696b6-7bda-47a8-8126-ef17c1071df6`, revision `df8c3ddff9f6f4a182f1a8dc41c729b7d4a5d988`). Tracking issue: #53 (children #54–#61, #52, #45, #44, #38).

- Markdown in `_posts/`, `_pages/` and `_data/comments/` is authoritative. Never rewrite article prose. Preserve front matter, tags, series and images.
- Comment data is kept in `_data/comments/` but is intentionally **not rendered**; there is no comment form and no Staticman integration.
- Analytics are intentionally absent (follow-up #65).
- Branch model: child branches `redesign/<issue>-<slug>` → integration branch `redesign/weblog-static` → `master`. Each child PR needs two completed independent reviews before merge.
- Never commit generated output (`dist/`, `.output/`, caches) or secrets.

## Code Review Rules

Report actionable **P0/P1** findings first, with file, line, impact and a concrete trigger. Do not report style preferences.

1. **Content and URL preservation.** Every original post, page, tag, series, image, comment record, front-matter field and historical public URL must still exist and render, including the historical `api-ateway` spelling and the UTC date permalink `/weblog/2022/07/16/setting-up-an-api-ateway-for-your-microservices.html`. Flag any change that edits, drops, reorders or duplicates authored content, changes a published URL without a working route, or loses image/asset files.
2. **Static deployment under `/weblog/`.** Output must be fully static and servable by GitHub Pages: correct base path for links, assets, scripts and fonts; direct loads and refreshes of every route work without a server; a real 404 page for unknown routes; no server-only runtime, server functions or `/__l5e/` Lovable-only URLs; deploy workflow publishes only intended public files with least-privilege permissions.
3. **Interaction and security regressions.** Navigation, search, appearance/theme preferences (12 themes, persistence, no flash of wrong theme), curated sections, responsive layout and keyboard access must keep working; comments stay omitted. Markdown/HTML from posts is rendered as untrusted input; external links use `rel="noopener noreferrer"`; no credentials, tracking scripts or third-party runtime dependencies are introduced beyond the documented font stylesheets; workflow permissions and dependencies are minimal and pinned.
4. **Verification quality.** Tests must be meaningful (content, route, behaviour, visual against the approved reference — never regenerate the reference from the new implementation to make a check pass). Flag missing cases that could let the site become unusable or lose content.
