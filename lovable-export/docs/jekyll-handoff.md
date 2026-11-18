# Jekyll handoff — Adi's Web Journal redesign

Production stays on Jekyll + Minimal Mistakes 4.22.0 (`remote_theme`) + Markdown + GitHub Pages at
`https://adisakshya.github.io/weblog/`. This Lovable project is a working mockup only. Requirements baseline:
the owner's 15-section brief v1.0 (15 Nov 2026).

## Content snapshot
`mockup-content/` = read-only copy of `adisakshya/weblog@e812fd4` (`_posts`, `_pages`, `_data/comments`). Never edit prose here;
production Markdown is authoritative.

## Route map (production paths unchanged — no redirects needed)
| Production URL | Mockup route | Note |
| --- | --- | --- |
| /weblog/ | /weblog | preview redirects `/` → `/weblog` |
| /weblog/2022/07/16/setting-up-an-api-ateway-for-your-microservices.html | same | historical "api-ateway" kept; date is UTC (front matter 2022-07-17 00:30 +0530) |
| /weblog/2022/02/01/introduction-to-api-gateway.html | same | |
| /weblog/2021/07/30/extension-pack-for-vscode-and-code-server.html | same | |
| /weblog/tags/{api-gateway,kong,microservices,docker,vscode,code-server,github,ci-cd,travis}/ | /weblog/tags/$tag | preview drops trailing slash (dev server only) |
| /weblog/series/api-gateway-101/ | /weblog/series/$series | Introduction → Setup |
| /weblog/contact/, /weblog/terms/ | same | |
| /weblog/feed.xml, /weblog/sitemap.xml | — | **404 in production today**; decision pending |
| /baseline/* | — | preview-only copy of the original import for comparison |

## File mapping (mockup → Jekyll)
| Mockup | Jekyll target |
| --- | --- |
| `src/styles/journal.css` tokens + prose | `assets/css/journal.css` (replaces `assets/css/dark.css`) |
| `PREFS_BOOT` in `src/lib/prefs.ts` | inline `<script>` in `_includes/head/custom.html` |
| `src/lib/prefs.ts`, `PrefsMenu.tsx` | `assets/js/prefs.js` + `_includes/prefs-menu.html` (replaces `theme-selector.js`) |
| `SearchDialog.tsx`, `src/content/search.ts` | `assets/js/search-dialog.js` using the theme's generated `lunr-store.js` (add series/pages via `search: true` front matter) |
| `ArticleBody.tsx` copy + lightbox | `assets/js/copy-code.js`, `assets/js/lightbox.js` |
| "On this page" `<details>` | `_includes/toc-inline.html` (kramdown `{:toc}` inside `<details>`) |
| `Shell.tsx` | `_includes/masthead.html`, `_includes/footer/custom.html` |
| `weblog.index.tsx` | `_layouts/home.html` (Posts default; internal `stories` view unchanged, `?view=index` and `?view=subjects` preserved) |
| article route | `_layouts/single.html` override + `_includes/series-nav.html` |
| `Cover.tsx` | `assets/images/covers/*.svg` + optional `cover`, `cover_alt` front matter |
| tag/series routes | `_layouts/archive-taxonomy.html`, `_layouts/series.html` |
| `src/content/curated-content.json`, `CuratedSections.tsx` | `_data/curated-content.json` + Posts-only `_includes/curated-sections.html`; preserve supplied YouTube timestamps and omit absent `thoughts` |
| `src/assets/curated/` image pointers and source manifest | download supplied originals to `assets/images/curated/`; use `relative_url` for Pages paths, retain attribution/source manifest |

Curated sections follow discovery in this order: Bookshelf (7/4/2 columns), Worth watching.
Final owner decision: remove Beyond the blog entirely (heading, biography, three profile links, portrait and collaboration CTA). Keep the global Meet Adi link and existing footer. The default view is labelled Posts, including its accessible name; retain the internal `stories` behavior for existing URLs.

Appearance has 12 persistent options. Preserve the eight existing IDs and add Spider-Man (`spiderman`, navy/red with subtle web), Batman (`batman`, charcoal/gold with angular skyline/shadows), Superman (`superman`, deep blue with red/gold and gentle radiance), Iron Man (`ironman`, burgundy/gold/cyan glow). Use distinct token-based swatches and lightweight static CSS decoration only in wide outer margins, hidden on phones. Article, menu and search surfaces remain opaque; fully theme text, links, buttons, code and syntax, with body/metadata/control contrast at least 4.5:1. The panel scrolls within the available viewport and keeps native keyboard-accessible radio controls. Resolved System theme still follows Daylight/Graphite; font, size and width controls are unchanged.

## Findings to carry over
- Setup article duplicate "Contribution": Markdown contains it once → duplicate comes from the layout. Remove the layout's copy.
- Comments: Staticman v2 endpoint `adisakshya-staticman.herokuapp.com` returns 404. Existing comments live in `_data/comments`. Owner decision pending.
- Analytics: Universal Analytics `UA-158913398-2` (retired by Google) + Microsoft Clarity. Kept as-is until owner decides.
- Agustina loads from fonts.cdnfonts.com (regular 400; masthead bold is synthesised, as in production). Self-hosting licence unverified.

## Step D verification (on a branch / fork Pages preview)
`bundle exec jekyll build`; every route-map URL returns 200 incl. direct load, refresh, trailing slash, anchors; 404 page;
`/weblog/` base for assets; repeat the mockup contrast, search and widths checks against built HTML. Rollback = revert merge.
