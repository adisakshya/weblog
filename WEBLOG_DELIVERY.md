# Weblog delivery — how the new site works

Live site: <https://adisakshya.github.io/weblog/> · Repository: <https://github.com/adisakshya/weblog> · Design reference: Lovable project `c12696b6-7bda-47a8-8126-ef17c1071df6`, revision `df8c3ddff9f6f4a182f1a8dc41c729b7d4a5d988`.

## 1. What changed, in one paragraph
The site is no longer Jekyll. It is a **fully prerendered static React site** (TanStack Start + Vite) that reproduces the approved "Adi's Web Journal" design — Posts / Subjects / Index home, search, series navigation, Bookshelf and Worth-watching, and 12 appearance themes — at the same public URL. Your Markdown stays the source of truth: posts live in `_posts/`, pages in `_pages/`, curated books/videos in `_data/curated-content.json`. `bun run build` turns them into plain HTML/CSS/JS in `dist/client`, and GitHub Actions publishes that folder to GitHub Pages.

## 2. Why this architecture
The approved design already existed as React components. Reusing them gives exact visual and interaction fidelity (the strict visual check matches 50/50 reference screenshots) for the least change, instead of re-implementing the design in another generator. Prerendering (not a server) keeps it compatible with GitHub Pages, keeps article HTML crawlable, and keeps every historical URL a real file. Alternatives considered: staying on Jekyll with a re-themed Minimal Mistakes (high risk of visual drift, no reuse of the approved code), or Astro/Eleventy (clean, but a rewrite of every component with nothing gained for a 3-post blog).

## 3. Map of the code
| Path | Purpose |
|---|---|
| `_posts/*.md`, `_pages/**`, `_data/` | **Your content.** Never reformatted by tooling. `_data/comments/` is kept but not rendered. |
| `src/content/content.ts` | Reads the Markdown at build time, renders it (marked + highlight.js), applies kramdown-style typography, resolves `{{site.baseurl}}`, **sanitizes** the HTML, builds tags/series/search data. |
| `src/routes/` | File-based routes under the `/weblog` base path: `_site.index.tsx` (home), `_site.$year.$month.$day.$file.tsx` (article), tags, series, about, contact, terms. |
| `src/components/journal/` | Approved components: Shell (header/footer), SearchDialog, PrefsMenu (themes), ArticleBody (copy buttons, lightbox), CuratedSections, Cover. |
| `src/styles/journal.css` | The design tokens (`--j-*`) for all 12 themes. |
| `vite.config.ts` | `base: /weblog/`, prerender settings (query-string pages are skipped; unlinked pages listed explicitly). |
| `scripts/postbuild.mjs`, `generate-feeds.mjs` | Writes `404.html`, `.nojekyll`, `sitemap.xml`, `feed.xml` (Atom). |
| `scripts/serve-dist.mjs` | Local server that behaves like GitHub Pages (301 to trailing slash, real 404). |
| `docs/inventory/` | Frozen legacy facts: source hashes, routes, rendered fixture, reasoned exemption rules. |
| `reference/` | The approved design: 50 screenshots, recovered covers, capture script lineage. **Never regenerate from the new site.** |
| `.github/workflows/ci.yml`, `deploy.yml` | Checks on every PR; publish on push to `master`. |

## 4. Add or edit a post (the everyday workflow)
1. Create `_posts/YYYY-MM-DD-your-title.md`:
   ```markdown
   ---
   title: "Your title"
   date: 2026-12-01 10:00:00 +0530
   tags: [kong, docker]          # a brand-new tag gets its own page automatically
   series: api-gateway-101       # optional; the series page lists parts oldest-first
   excerpt: One sentence shown on cards and in search.
   ---

   Write Markdown. Use ```bash fences for code, `![alt](https://…/image.png)` for images,
   and `<video controls><source src="…" type="video/webm"></video>` if you need video.
   ```
2. The URL is `/weblog/YYYY/MM/DD/your-title.html` using the **UTC** date of `date:` (a `+0530` time before 05:30 IST falls on the previous UTC day — this is how the existing `api-ateway` post got its `07/16` URL). Do not rename a published post's file: the file name is the URL.
3. Preview: `bun run dev` → <http://localhost:3000/weblog/> (auto-reloads).
4. Open a pull request. CI runs every check; merging to `master` publishes.
5. A new curated book/video: copy the cover image to `public/curated/`, add an entry to `_data/curated-content.json` (`cover`/`thumbnail` = the file name). No code change and no test edit — the unit, browser, live-check and visual gates derive their expectations from the data, and this exact path (a new article with a new tag **and** a new book) is run through all of them by `tests/publish-path.test.mjs`.

A post first published elsewhere (for example HackerNoon) keeps its authored text exactly and adds `original_url: "https://…"` to the front matter: the page's `<link rel="canonical">` then points at that URL, and the text should say "Originally published on …". Its `header.teaser` image is shown on the home page and tag/series cards (only the three original posts have hand-made cover artwork).

### Drafts (preview before publishing)
Put an unfinished post in `_drafts/YYYY-MM-DD-your-title.md` (same front matter as a post). After the next deploy it is listed at `/weblog/drafts/` and opens at `/weblog/drafts/your-title/`, rendered like a published post with a "Draft preview" bar and a checklist of what is still missing (title, excerpt, tags, teaser image). Locally: `bun run dev` → <http://localhost:5173/weblog/drafts/>.

- **Publish it:** `git mv _drafts/2026-12-01-your-title.md _posts/2026-12-01-your-title.md`. Nothing else changes.
- **It is not private.** The page is unlisted, `noindex,nofollow`, has no canonical, and is absent from the home page, tags, series, search, `sitemap.xml` and `feed.xml`, but GitHub Pages has no access control: anyone with the URL can read it, and `_drafts/` is visible in the repository. Keep secrets out of drafts.
- **Hold a file back completely:** start its name with `_` (`_2026-12-01-idea.md`). It is not built or bundled.
- Tags on a draft are plain labels (they do not create tag pages). `tests/drafts.test.mjs` guards all of this.

Raw HTML in Markdown is sanitized: only `<video>`/`<source>` and Markdown's own output survive; scripts, event handlers, iframes and `javascript:` URLs are removed (`sanitizePostHtml` in `content.ts`). To allow another tag, extend the allowlist there on purpose.

## 5. Commands
```sh
bun install --frozen-lockfile
bun run dev                    # develop
bun run build                  # static site in dist/client (+404, sitemap, feed)
bun run preview                # serve it like GitHub Pages: http://127.0.0.1:4300/weblog/
bun run typecheck && bun run lint && bun run test
bun run test:e2e               # all Chromium suites (run `bunx playwright install chromium` once)
python3 tests/test_legacy_inventory.py   # your original files are byte-identical
python3 scripts/check_content_fidelity.py && python3 tests/test_content_fidelity.py
node scripts/check-dist.mjs    # every legacy URL exists in the build
bun run visual                 # visual comparison with the approved reference (page bodies only, see docs/redesign/README.md)
node scripts/live-check.mjs https://adisakshya.github.io   # verify production
```

## 6. What protects you (quality gates)
- **Content preservation** — every authored file byte-identical to the legacy baseline (`e812fd4`); every legacy public URL present; a content-fidelity gate checks every legacy paragraph, code block (exact whitespace), link, image, anchor and date reappears in the new HTML unless a *reasoned* rule exempts it (10 negative tests prove it fails when content is lost).
- **Security** — post HTML sanitized; external links `noopener`; workflows have minimal permissions; no analytics, no third-party scripts (only font stylesheets).
- **Behaviour** — about 140 Chromium tests, including reading controls (computed typography, visible selection, keyboard, short phones, stored-value compatibility, blocked storage), header and footer layout at six widths and under zoom, and exact footer destinations; plus: every route direct-loads and refreshes, real 404, search (including deep text), 12-theme persistence with no flash, WCAG AA contrast in every theme, keyboard order and focus, no horizontal overflow at 5 widths, all links resolve.
- **Visual** — 50 screenshots (11 routes × 2 widths, panels, 12 themes) against the approved reference. Since the header and footer were redesigned (#74, #76) and the reference still shows the old chrome, each shot is compared on its page body (`<main>`) only, in the tolerant structural mode, and the four search/Appearance panel shots and the two 404 shots (redesigned on purpose, #87) are covered by browser tests instead (`docs/redesign/README.md`, "Body-region comparison"). Re-capture the reference from the new Lovable design to return to whole-page comparison; CI uses a noise-tolerant structural comparison with negative fixtures from every reference shot. **When you add an article, tag, series, book or video**, the 14 shots that render lists built from all content (home, tag and series pages, the search/appearance panels over the home page) can no longer match the frozen reference; the comparator then skips exactly those shots, by name and loudly (`SKIP …`), and the other 34 (article pages, 12 themes, Contact, Terms) stay mandatory. The two 404 shots are skipped by name too: the not-found page was redesigned on purpose (#87) and the reference is not recaptured. Skipping happens only for a *pure addition* to the approved content list in `docs/redesign/visual-baseline.json`; removing or renaming any approved item never skips anything (`tests/visual-content.test.mjs`, and `tests/publish-path.test.mjs` runs the whole gate on a copy with a new article and book). The home page for new content is still covered by the route, content, search and live-check tests. *Known flake:* the strict pixel run (`bun run visual`) occasionally differs by about 10–15 pixels of one glyph's anti-aliasing in a single article shot (it happened about once in four runs, also on the code before the last change); a re-run passes, and a real regression differs by far more (the structural CI gate and its negative fixtures cover that).

## 7. Decisions, disabled features and deviations
| Item | Status | Why / how to change |
|---|---|---|
| Comments + Staticman | **Omitted** | Owner decision. Data stays in `_data/comments/` (unrendered). |
| Analytics (Universal Analytics + Microsoft Clarity) | **Omitted** | Owner decision; UA is retired. Follow-up: issue #65 (re-add Clarity with a privacy disclosure). |
| Old theme CSS/JS URLs (`/assets/css/dark.css`, `/assets/js/*.js`) | Gone | Jekyll theme internals, not authored content (`docs/inventory/intentional-removals.json`). Images/favicon keep their URLs. |
| Front-matter header/teaser images | Not displayed | The approved design uses cover art; the URLs remain in the Markdown and in Open Graph tags. |
| Terms page date | Not displayed | Not in the approved design; front matter is untouched. |
| Typographic quotes (`don’t`) | Kept as published | The live Jekyll site rendered curly quotes; the mockup used straight ones. 6 visual shots are allowed for this (`docs/redesign/visual-allowlist.json`). Reverse by changing `typographic()` in `content.ts`. |
| `sitemap.xml`, `feed.xml` | **Added** | Both were 404 before. |
| Gemfile served publicly | **Fixed** | The Jekyll site published `/weblog/Gemfile`; only `dist/client` is deployed now. |
| Agustina masthead font | CDN (as in the design) | Self-hosting licence unverified; left as the owner decided. |

## 8. Publish, roll back, resume
See [`docs/redesign/release.md`](docs/redesign/release.md). In short: push to `master` → Actions builds, re-runs all checks, deploys, then runs the live check. Roll back by re-running **Deploy to GitHub Pages** with `ref` = a previous good commit, or `git revert -m 1`; the last Jekyll state is preserved as branch `legacy/jekyll-e812fd4`. Run history and decisions: `WEBLOG_RUN_LEDGER.md`.

## 9. A 10-minute walkthrough: follow one article from Markdown to the browser
1. Open `_posts/2022-02-01-introduction-to-api-gateway.md`. The front matter (`title`, `date`, `tags`, `series`, `excerpt`) is data; the body is Markdown.
2. `src/content/content.ts` finds it with `import.meta.glob("/_posts/*.md")` and `render()` turns the body into HTML: marked parses it, our renderer adds heading anchors and copy-ready code blocks, `typographic()` makes quotes curly, `sanitizePostHtml()` strips anything unsafe. The URL is built from the UTC date: `/weblog/2022/02/01/introduction-to-api-gateway.html`.
3. `src/routes/_site.$year.$month.$day.$file.tsx` matches that URL pattern, looks the post up, and renders the title, cover, "On this page" list, `ArticleBody` and the series navigation.
4. `bun run build` prerenders every route into a real file: `dist/client/2022/02/01/introduction-to-api-gateway.html`. GitHub Pages serves it directly — no server runs. The browser then **hydrates** the page so search, themes and the lightbox work.
5. `bun run preview` and open the URL; press `/` to search for "kong", open **Appearance** and pick **Batman**, refresh — the theme is applied before the page paints (a tiny inline script in `<head>` reads `localStorage`).
6. Run `node --test tests/publish-path.test.mjs` to watch the same path work for a brand-new article and book.
