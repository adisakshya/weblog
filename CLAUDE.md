# CLAUDE.md

Operating guide for Claude Code (or any future contributor) working in this repository. This is a **personal Jekyll blog** deployed on **GitHub Pages**. Read this before making changes — it documents what actually exists in the repo, not an idealized version of it.

## Project overview

- **Purpose**: personal blog of Adisakshya Chauhan (`_config.yml: title`, `email: adisakshya98@gmail.com`) — technical write-ups on things like API gateways, VS Code tooling, and CI/CD.
- **Live URL**: `https://adisakshya.github.io/weblog/` — built from `url: "https://adisakshya.github.io"` + `baseurl: "/weblog"` in `_config.yml`. There is no `CNAME` file, so this is a GitHub Pages *project* site, not a custom domain.
- **Framework**: Jekyll, built via the `github-pages` gem (see `Gemfile.lock`: `jekyll (3.9.0)` pinned by `github-pages (214)`). This pins the exact Jekyll/plugin versions GitHub Pages' own build infrastructure uses.
- **Theme**: [Minimal Mistakes](https://mmistakes.github.io/minimal-mistakes/) is loaded as a **remote theme**, not the gem-based `theme:` directive. Evidence in `_config.yml`:
  ```yaml
  # theme: "minimal-mistakes-jekyll"
  remote_theme: "mmistakes/minimal-mistakes@4.22.0"
  ```
  The `theme:` line is commented out. `minimal-mistakes-jekyll` is still listed in the `Gemfile`/`Gemfile.lock`, but that's only to satisfy the `jekyll-remote-theme` plugin's dependency resolution — the actual layouts/includes/Sass come from the pinned GitHub ref `mmistakes/minimal-mistakes@4.22.0` at build time, not from the local gem's vendored files. There is no vendored copy of the theme in this repo (no `_layouts`/`_includes` fork of the full theme — only overrides, see below).
- **Generated output**: `_site/` (build output), `.jekyll-cache/`, `.sass-cache/` — all git-ignored (`.gitignore`). Never hand-edit anything under `_site/`; it is fully regenerated on every build.

### Role of each content type
- **Posts** (`_posts/`) — dated articles, the core content type.
- **Pages** (`_pages/`, included via `include: ["_pages"]` in `_config.yml`) — durable, non-dated content: About, Contact, Terms, tag/topic landing pages, series landing pages.
- **Layouts** (`_layouts/`) — only the templates this repo *overrides* on top of the remote theme: `default.html`, `home.html`, `archive.html`, `single.html`, `series.html`. Everything else (e.g. `page`, `posts`) falls back to the remote theme's built-in layouts.
- **Includes** (`_includes/`) — repo-specific overrides/additions on top of the theme: footer, author profile, comments, custom `<head>` injection, series/tag listing partials, pagination, footnotes.
- **Sass** (`_sass/`) — `minimal-mistakes.scss` imports the theme's own partials plus `custom/main.scss`, which pulls in this repo's own partials under `_sass/custom/` (per-page/feature stylesheets: `home`, `article`, `tag`, `post`, `footer`, `contact`, `theme`, `comments`, `series`, `sayings`) and defines the light/dark CSS custom properties (`:root` / `[data-theme="dark"]`).
- **Assets** (`assets/`) — `css/dark.css`, `js/main.min.js` (theme's own bundle), `js/sayings.js`, `js/theme-selector.js` (the dark-mode toggle), `favicon.ico`, and local images (`avatar.jpg`, `jekyll.png`, `sun.webp`). Most post/teaser imagery is hosted externally (Cloudinary, or a `static-assets` branch on this same GitHub repo — see below).
- **Configuration**: `_config.yml` (site settings, author, footer links, comments provider, pagination), `Gemfile`/`Gemfile.lock` (dependency pins), `staticman.yml` (comment form backend config).
- **Comments**: handled by Staticman (see dedicated section below) — accepted comments are stored as static YAML files under `_data/comments/<slug>/`.

## Repository structure

```
_config.yml           Site settings: title, url/baseurl, remote_theme, plugins, author, footer, comments, pagination
Gemfile / Gemfile.lock  Ruby dependency pins (github-pages, minimal-mistakes-jekyll, jekyll-paginate, jekyll-include-cache)
staticman.yml          Staticman comment-bot config (fields, moderation, storage path/format)
index.html             Home page entry point (layout: home)
404.html               Custom 404 page
LICENSE                MIT license
README.md              Project readme (excluded from the build via _config.yml `exclude:`)

_posts/                Blog posts, filename format YYYY-MM-DD-title.md
_pages/                Durable pages (About, Contact, Terms) + taxonomy landing pages
  _pages/tags/*.md        One landing page per tag (layout: tag)
  _pages/series/*.md      One landing page per post series (layout: series)

_layouts/              Repo-local layout overrides (default, home, archive, single, series)
_includes/             Repo-local include overrides (footer, author-profile, comments, series/tag partials, head/custom.html, ...)
_sass/                 Theme Sass entry point + custom/*.scss partials
_data/comments/<slug>/ Generated Staticman comment YAML files (one file per approved comment)

assets/                CSS, JS, favicon, and the few images kept in-repo
```

## Local development and validation

Verified from `Gemfile`/`Gemfile.lock` — no test suite or linter exists in this repo (no Rakefile, no RuboCop config, no CI workflow, no HTML-proofer setup). "Validation" for this repo means: a successful Jekyll build plus manual visual/link checking.

```bash
# Install dependencies
bundle install

# Run the site locally with live reload
bundle exec jekyll serve

# Build only (outputs to _site/)
bundle exec jekyll build

# Clean generated output
bundle exec jekyll clean
# (equivalent to: rm -rf _site .jekyll-cache .sass-cache)
```

**Base path**: because `baseurl: "/weblog"` is set, `jekyll serve` prints a root URL of `http://127.0.0.1:4000/`, but the site itself is only mounted under `/weblog`. Always preview at:

```
http://127.0.0.1:4000/weblog/
```

Visiting `http://127.0.0.1:4000/` directly will 404 in most setups — this is expected, not a bug.

**Known environment caveat (disclosed, not fixed)**: `Gemfile.lock` pins `nokogiri (1.11.3)`, which requires Ruby `< 3.1`. In this sandbox only Ruby 3.1.6/3.2.6/3.3.6 were available, so `bundle install` fails with:
```
nokogiri-1.11.3-x86_64-linux requires ruby version < 3.1.dev, >= 2.5, which is incompatible with the current version, ruby 3.3.6p108
```
This is an artifact of the sandbox's Ruby version, not a bug to fix here — do not bump gem versions to work around it unless the user explicitly asks for a dependency upgrade. If you need to validate a change, use a Ruby ≤ 3.0 toolchain (e.g. via `rbenv`) before running `bundle install`.

## Adding a blog post

- **Filename**: `_posts/YYYY-MM-DD-title-slug.md` (matches every existing post, e.g. `_posts/2022-07-17-setting-up-an-api-ateway-for-your-microservices.md`). The date in the filename drives the post's date and permalink — Jekyll's default post permalink style is in effect (no custom `permalink:` pattern is set in `_config.yml`).
- **Defaults already applied** to every post via the front matter defaults block in `_config.yml` — do **not** repeat these in a post's front matter:
  ```yaml
  layout: single
  show_date: true
  read_time: true
  share: false
  related: false
  author_profile: false
  footnotes: true
  ```
- **Front matter you do set per post** (see existing posts for the pattern):
  - `title` — required.
  - `date` — required, `YYYY-MM-DD HH:MM:SS +ZZZZ` (existing posts use `+0530`, IST).
  - `tags` — array of existing (or deliberately new) lowercase-hyphenated slugs, e.g. `[api-gateway, kong]`. See "Topics, categories, and tags" below before adding a new one.
  - `series` — optional; only set if the post belongs to a series (see "Post series" below). Must exactly match a series `taxonomy` value.
  - `header.image` / `header.teaser` — optional banner/card image URLs.
  - `excerpt` — optional short summary used in listings/meta tags.
  - `comments: true` — set explicitly to enable the Staticman comment form on that post (it's not in the sitewide defaults, so posts must opt in).
- **Minimal front matter example** (based on `_posts/2022-02-01-introduction-to-api-gateway.md`):
  ```yaml
  ---
  title: "My New Post Title"
  date: 2026-07-18 09:00:00 +0530
  tags: [docker]
  excerpt: One or two sentence summary shown in listings.
  comments: true
  ---
  ```
- **Table of contents**: the `single` layout supports `toc: true` (and `toc_sticky: true`) front matter flags if a post wants one — none of the existing posts use it, so only add it if a post is long enough to warrant it.
- **Body conventions**: standard kramdown Markdown (GitHub Pages default processor) plus raw HTML where needed (existing posts embed `<video>` tags directly). Liquid is available in post bodies (`{{ site.baseurl }}` is used for internal links in `2022-07-17-...md`). Fenced code blocks use standard triple-backtick with a language hint (` ```bash `, ` ```json `, ` ```docker `, etc.) for Rouge syntax highlighting. Footnotes render through `_includes/footnotes.html` (kramdown footnote syntax `[^1]`), enabled by the `footnotes: true` post default.
- **Internal links**: prefix path-based links with `{{ site.baseurl }}` (e.g. `{{site.baseurl}}/series/api-gateway-101/`) rather than hardcoding `/weblog/...`, so links keep working if `baseurl` ever changes — though note the codebase is not 100% consistent about this (some includes hardcode `/weblog/`, see "Theme and UI customization").
- **Images and downloadable assets**: this repo does **not** keep post imagery locally. Existing posts pull images from Cloudinary (`res.cloudinary.com/adisakshya/...`) or from a `static-assets` branch of this same GitHub repo referenced via `raw.githubusercontent.com/adisakshya/weblog/static-assets/...`. Follow whichever pattern fits your workflow; don't commit large binary images to the `master`/working branch's `assets/` folder — that folder is reserved for site chrome (favicon, avatar, a couple of theme images, CSS/JS).
- **Previewing/validating a new post**: `bundle exec jekyll serve`, then check `http://127.0.0.1:4000/weblog/<permalink>/`, confirm it appears in the home page listing/pagination, confirm any `tags`/`series` show up on the relevant tag/series landing page, and confirm the comment form only appears if `comments: true` was set intentionally.
- **Preserving published URLs**: never rename or change the date prefix of an existing post's filename — that changes its permalink and breaks the published URL. Correcting a typo in a title is fine; changing the filename is not.
- **Drafts**: `_drafts/` is **not** used anywhere in this repo (no such folder exists, `_config.yml` has no drafts-related settings). If you want an unpublished/WIP post, use Jekyll's standard `_drafts/YYYY-MM-DD-title.md` (no date needed in filename) with `bundle exec jekyll serve --drafts` — this is a stock Jekyll capability, not something already wired up or tested in this repo.

## Post series

A series mechanism **already exists** — use it as-is, don't invent a parallel convention.

- **Series landing page**: add `_pages/series/<series-slug>.md` with:
  ```yaml
  ---
  title: "My Series Title"
  layout: series
  permalink: /series/<series-slug>/
  excerpt: One or two sentences describing the series.
  teaser: /assets/images/some-image.png   # or an external URL
  taxonomy: <series-slug>
  ---
  ```
  (`taxonomy` is the key that ties the landing page to member posts — see `_pages/series/api-gateway-101.md` / `blogging-101.md`.)
- **Adding a post to the series**: set `series: <series-slug>` in the post's front matter, exactly matching the landing page's `taxonomy` value (see `series: api-gateway-101` in both API Gateway posts).
- **Ordering**: series membership/listing order follows `site.posts` order (reverse-chronological, i.e. publish date), via `_includes/series-post.html`. There is no manual/explicit ordering field — if posts need to appear in a specific reading order, their `date` values must reflect that order.
- **Previous/next links**: handled automatically and sitewide by `_includes/post_pagination.html` (chronological previous/next across *all* posts, not scoped to the series) — no per-series prev/next mechanism exists.
- **In-post "part of a series" block**: `_includes/post-series.html` runs automatically on every `single` layout page (wired into `_layouts/single.html`) and renders "This post is part of `<series>` series" with a link to every other post sharing the same `series` value — this needs no extra front matter beyond `series:` on each post.
- **Series index**: `_includes/series-list.html` (rendered on `archive.html`, i.e. the home/blog listing) auto-lists every distinct `series` value found across `site.posts` — a new series with at least one tagged post appears here automatically, no navigation update required.
- No new plugins are needed for any of this — it's all built from existing Liquid (`site.posts` iteration + `taxonomy`/`series` front matter matching).

## Topics, categories, and tags

- This repo uses **tags only** — `categories` is not used anywhere in existing posts or `_config.yml`. Don't introduce `categories` unless explicitly asked; it would need its own taxonomy page convention to be useful, which doesn't exist.
- **Slug convention**: tag values in post front matter are lowercase, hyphenated where multi-word — e.g. `[vscode, code-server, github, ci-cd, travis]`, `[api-gateway, kong]`, `[api-gateway, kong, microservices, docker]`. Never introduce variants like `Machine Learning`, `machine_learning`, or `ML` for the same concept — reuse the exact existing slug.
- **Existing tag slugs** (from `_pages/tags/`): `api-gateway`, `ci-cd`, `code-server`, `docker`, `github`, `kong`, `microservices`, `travis`, `vscode`. Check this list (and `_pages/tags/*.md` `taxonomy:` values) before inventing a new tag for a topic that's already covered.
- **Tag landing pages**: each tag has a corresponding `_pages/tags/<slug>.md` page:
  ```yaml
  ---
  title: "Human-Readable Tag Name"
  layout: tag
  permalink: /tags/<slug>/
  excerpt: Post listing for the tag <slug>.
  teaser: <image url>
  taxonomy: <slug>
  ---
  ```
  `title` is a Title Case display name (e.g. `"Continuous Integration & Continuous Delivery"` for `ci-cd`), while `taxonomy`/`permalink`/the tag slug used in posts stay lowercase-hyphenated. Keep this split consistent for any new tag.
- **Archive/topic discovery**: `_includes/tag-list.html` (rendered on the home/archive page) auto-builds a "Browse by topic" index from `site.tags`, sorted by post count — it needs no manual update when a tag page is added, as long as at least one post uses that tag.
- **Introducing a genuinely new topic**: (1) pick a lowercase-hyphenated slug that doesn't collide with the existing list above, (2) add the tag to the relevant post(s)' `tags:` array, (3) add a matching `_pages/tags/<slug>.md` landing page using the template above so the tag has a real destination page instead of Jekyll's default (theme-provided) tag archive.

## Pages and content organization

- **Post vs. page**: if it's dated, chronological, and belongs in the blog feed/archive/tag-and-series system → `_posts/`. If it's durable, evergreen, and reached via direct navigation rather than the feed → `_pages/`.
- **`_pages/` layout**: flat for standalone pages (`about.md`, `contact.md`, `terms.md`), with subfolders per taxonomy type (`_pages/tags/`, `_pages/series/`) — follow this existing split; don't flatten it or invent a third taxonomy folder without a real need.
- **Permalinks**: every page in `_pages/` sets its own explicit `permalink:` in front matter (e.g. `/about/`, `/contact/`, `/tags/docker/`) — there's no permalink pattern derived from file path, so a new page must always declare `permalink:` explicitly.
- **Navigation**: there is **no** `_data/navigation.yml` in this repo, so Minimal Mistakes' standard main-menu (`{% include masthead.html %}` navigation list) is effectively unpopulated/not wired up here — the only sitewide navigation is the custom footer (`_includes/footer.html`, hardcoded list: Home, Contact, Terms & policies) and the author-profile social links block (`_includes/author-profile.html`, populated from `_config.yml: author.links`) which only appears where `author_profile: true`.
- **Adding a page without navigation**: just add the `_pages/*.md` file with its own `permalink:` — since there's no navigation data file wiring pages into a menu, a new page is automatically "unlisted" unless you take an explicit step (below) to surface it.
- **Adding a page to navigation/footer intentionally**: for the footer, add a new `<li>` entry to the hardcoded list in `_includes/footer.html`. For a real main-nav menu, you'd need to create `_data/navigation.yml` (standard Minimal Mistakes convention) and reference it from `_includes/masthead.html` via a repo-local override — this does not exist yet, so treat adding sitewide main navigation as a deliberate, visible change, not a side effect of adding a page.
- **Redirects**: no redirect mechanism (e.g. `jekyll-redirect-from` front matter usage) appears in any existing page/post — if a URL must move, coordinate explicitly rather than assuming redirects are handled.

## Topic and series landing pages

Use the existing `tag`/`series` layouts and page conventions documented above for any new topic, series, project, or research-theme hub — don't create new layouts/includes for this unless the existing `tag`/`series` machinery genuinely can't express what's needed:

| Type | Location | Layout | Permalink pattern | Key front matter |
|---|---|---|---|---|
| Topic/tag hub | `_pages/tags/<slug>.md` | `tag` | `/tags/<slug>/` | `taxonomy: <slug>` matching posts' `tags:` |
| Series hub | `_pages/series/<slug>.md` | `series` | `/series/<slug>/` | `taxonomy: <slug>` matching posts' `series:` |

For something that's neither a tag nor a series (e.g. a "Projects" page), the closest existing pattern is a plain `_pages/*.md` page (like `about.md`) with a hand-written Liquid loop over `site.posts`/`site.tags` if it needs to filter content — model it on `_includes/tag-list.html` or `_includes/posts-tag.html` rather than introducing a new plugin. Link to it manually from wherever makes sense (footer, a relevant post/page) — remember there is no main-nav data file to update (see above).

## Navigation and discoverability

- **Main navigation**: not configured (no `_data/navigation.yml`) — see "Pages and content organization."
- **Footer**: two independent footer surfaces — the page-level footer links in `_includes/footer.html` (Home/Contact/Terms, hardcoded `<li>`s) and the icon links driven by `_config.yml: footer.links` (Twitter, GitHub, a "website" link to `https://adisakshya.codes`-style root `/`, LinkedIn, mailto).
- **Author profile links**: driven by `_config.yml: author.links` (Adisakshya Codes, Twitter, GitHub, LinkedIn), rendered via `_includes/author-profile.html` wherever `author_profile: true` is set (currently not set on posts/pages by default — the front-matter defaults set `author_profile: false`).
- **Home-page pagination**: `_layouts/home.html`/`archive.html` uses `paginate: 5` / `paginate_path: "/page:num/"` from `_config.yml`, via the `jekyll-paginate` plugin (explicitly listed in `plugins:`) and `_includes/post_pagination.html`... actually pagination links render via the theme's `paginator.html` include, called from `archive.html`.
- **Search**: `search: true` in `_config.yml` enables the theme's built-in Lunr-based search UI (rendered via `search/search_form.html`, included from `_layouts/default.html`).
- **Related posts**: the theme supports a "related posts" block on `single.html`, but the sitewide default is `related: false` — it's off unless a specific post opts in.
- **Topic/tag discoverability**: via `_includes/tag-list.html` ("Browse by topic") and `_includes/series-list.html` ("Browse by series"), both rendered on the archive/home page.
- **Do not** add individual blog posts to any navigation surface (footer or a future main nav) — navigation is reserved for durable pages/hubs (About, Contact, Terms, tag/series landing pages), consistent with current usage.

## Sitemap and SEO discovery

- **No explicit `jekyll-sitemap` entry** in `_config.yml`'s `plugins:` list (only `jekyll-include-cache` and `jekyll-paginate` are listed there). However, `jekyll-sitemap` **is** a resolved dependency in `Gemfile.lock` (pulled in transitively by both the `github-pages` gem and `minimal-mistakes-jekyll`).
- **Important nuance, not to be assumed away**: GitHub's own Pages build infrastructure automatically whitelists a fixed set of plugins (including `jekyll-sitemap`, `jekyll-feed`, `jekyll-seo-tag`) even when they're not listed under `plugins:` in `_config.yml` — but a **local** `bundle exec jekyll build`/`serve` using the same `github-pages` gem does **not** get that same automatic whitelisting; local Jekyll only activates plugins explicitly listed in `plugins:`. In other words: the deployed site on `github.io` may generate a sitemap that a local build of this exact repo does not. **Do not assume the sitemap works identically in both places — verify the deployed URL directly.**
- **Expected deployed sitemap URL** (if active): `https://adisakshya.github.io/weblog/sitemap.xml`.
- **No `robots.txt`** file exists in the repo, and no manual `sitemap.xml` file exists either — there is exactly one possible sitemap source here (the transitively-installed `jekyll-sitemap` gem, activated only if/when GitHub Pages' safelist kicks in). Do not add a second/manual sitemap mechanism on top of this.
- **No `jekyll-feed`/`jekyll-seo-tag` entries** in `plugins:` either, despite both being present in `Gemfile.lock` — the same caveat above applies to RSS feed and SEO `<meta>`/canonical tag generation: possibly active on GitHub's hosted build, not guaranteed locally.
- **`url`/`baseurl` effect**: any sitemap/feed entries generated would be prefixed with `https://adisakshya.github.io/weblog` (from `url` + `baseurl`), matching every other internal link in the site.
- **Pagination pages** (`/page2/`, etc.) and the taxonomy pages under `_pages/tags/`/`_pages/series/` are ordinary Jekyll pages/posts with no `sitemap: false`/`published: false` flags set anywhere, so if `jekyll-sitemap` is active, they'd all be included as-is — there is currently no exclusion mechanism in use.
- **Recommendation if a sitemap is confirmed missing on the deployed site**: the smallest GitHub Pages-compatible fix would be adding `jekyll-sitemap` to the `plugins:` list in `_config.yml` (it's already an installed dependency, so no `Gemfile` change would even be needed) — but do not make this change speculatively; first confirm `https://adisakshya.github.io/weblog/sitemap.xml` is actually missing.

## Theme and UI customization

- **Loading**: `remote_theme: "mmistakes/minimal-mistakes@4.22.0"` (see "Project overview"). Never try to "find and edit" the theme's own layouts/includes/Sass in this repo — they aren't here; they're fetched by `jekyll-remote-theme` at build time.
- **Where overrides belong**: `_layouts/*.html` and `_includes/*.html` at repo root shadow the remote theme's files of the same name. Only override a file here if you need to actually change its behavior — for a wholly new fragment, add a new, distinctly-named partial rather than a same-named override, unless you specifically intend to replace theme behavior.
- **Sass**: `_sass/minimal-mistakes.scss` is itself a repo-local override of the theme's main Sass entry point (it explicitly `@import`s the theme's own partials plus `custom/main.scss`) — this is how repo-specific CSS variables/rules (`_sass/custom/*.scss`) get layered on top of the stock theme styling. Add new custom styling under `_sass/custom/`, and wire it in via an `@import` in `_sass/custom/main.scss`, following the existing pattern.
- **JS**: repo-specific behavior lives in `assets/js/theme-selector.js` (dark/light toggle, `localStorage`-backed) and `assets/js/sayings.js` (the rotating quote on the archive page) — `assets/js/main.min.js` is the theme's own bundled JS, don't hand-edit it.
- **Generated directories**: never edit `_site/`, `.jekyll-cache/`, or `.sass-cache/` — all are git-ignored build output, fully regenerated on every build.
- **`/weblog` base path caveat**: most includes correctly use Jekyll's `relative_url`/`absolute_url` filters or `{{ site.baseurl }}`, but a few hardcode the literal string `/weblog/` instead — e.g. `_layouts/default.html` (`sun.webp`, `theme-selector.js`), `_includes/head/custom.html` (`dark.css`), `_includes/archive-single.html` and `_layouts/single.html` (tag links `/weblog/tags/{{ tag }}`). This is existing, working behavior tied to the current `baseurl: "/weblog"` — **preserve it as-is**; if `baseurl` ever changes, all of these hardcoded strings would need a manual, coordinated update (they will not pick up a `baseurl` change automatically the way `relative_url`-based links would).

## Comments and integrations

- **Provider**: Staticman v2 (`_config.yml: comments.provider: staticman_v2`), configured further in root `staticman.yml` (fields: name/email/message, `moderation: true`, stored as YAML under `_data/comments/{options.slug}/`, email hashed via `md5` for Gravatar lookup).
- **Endpoint**: `https://adisakshya-staticman.herokuapp.com/v3/entry/github/` (`_config.yml: comments.staticman.endpoint`) — a **personally-hosted Heroku app**. Heroku discontinued its free-dyno tier in November 2022; this endpoint's continued availability has **not been verified** as part of this change and should be treated as a likely-stale external dependency. Do not attempt to fix, replace, or re-point this integration unless explicitly asked — just be aware new comment submissions may silently fail if the endpoint is down.
- **Stored comments**: `_data/comments/<post-slug>/comment-<timestamp>-<name>.yml`, rendered via `_includes/comments.html`/`comment.html`. Note some stored comment folders (e.g. `_data/comments/welcome-to-jekyll/`, `_data/comments/my-name-is-adisakshya/`) reference post slugs that no longer exist under `_posts/` — leftover data from posts that were since removed/renamed. This is pre-existing stale data; leave it as-is unless asked to clean it up.
- **Per-post opt-in**: comments only render if a post/page sets `comments: true` explicitly (not part of the sitewide defaults).
- **Other integrations**: Google Analytics (`_includes/head/custom.html`, `gtag.js`, property `UA-158913398-2` — a Universal Analytics ID; GA sunset Universal Analytics in 2023/2024, so this too is a likely-stale, unverified integration) and Microsoft Clarity (same file, project id `jdzt2qtsi5`, added recently per git history — `installed Microsoft clarity`). Google Fonts (`Montserrat`, and `Agustina` via `fonts.cdnfonts.com`) are also loaded from `_includes/head/custom.html`.

## Deployment

- **Default branch**: `master` (also the branch referenced by `comments.staticman.branch` and Staticman's own `branch` config in `staticman.yml`).
- **No `.github/workflows/` directory exists** in this repo — deployment is the classic **branch-based GitHub Pages build** (GitHub's own infrastructure runs Jekyll against the `github-pages` gem versions pinned in `Gemfile.lock` whenever the deployment branch is pushed), not a GitHub Actions-based Pages deployment.
- **GitHub Pages configuration** (Settings → Pages, not visible from repo files) should be verified to confirm which branch/folder GitHub is actually building from — inferred here to be `master` based on the Staticman branch config and `git log`, but this wasn't independently confirmed via the GitHub API in this change.
- **`url`/`baseurl` effect**: `url: "https://adisakshya.github.io"` + `baseurl: "/weblog"` together produce every absolute link/asset path in the site (e.g. `{{ site.url }}{{ site.baseurl }}/...` patterns seen in `_includes/comments.html`). Changing either would move the canonical site address and break every hardcoded `/weblog/...` reference described above — treat this as a high-blast-radius change.
- **Before changing any deployment setting**: confirm the actual GitHub Pages source branch/folder in repo settings, confirm no CNAME/custom-domain expectation has been added elsewhere, and re-check every hardcoded `/weblog/` reference this document lists, since none of them would auto-update.

## Claude change guidelines

- Make the smallest coherent change that satisfies the request.
- Inspect existing patterns (a similar post, tag page, series page, include) before creating a new file from scratch.
- Preserve existing front matter, permalinks, and published URLs — never rename a post file or change a page's `permalink:` without a clear, explicit reason.
- Don't mass-reformat historical posts/pages for style consistency as a side effect of an unrelated change.
- Never edit generated output (`_site/`, `.jekyll-cache/`, `.sass-cache/`).
- Don't add Ruby gems, npm packages, or Jekyll plugins without a clear, stated requirement — this site intentionally runs on a small, GitHub Pages-safe plugin list.
- Never expose credentials/secrets — note that this repo has no secrets checked in (Staticman endpoint and GA/Clarity IDs are public identifiers, not credentials).
- Don't remove or "clean up" legacy-looking functionality (e.g. the Staticman comment data, the old Google Analytics snippet) just because it looks outdated — flag it instead, per the disclosures above.
- Validate YAML front matter indentation, Liquid tag syntax (`{% %}` / `{{ }}` balance), internal links, and asset paths before considering a change done.
- Keep this document (`CLAUDE.md`) synchronized with actual repo behavior if you change something it describes.
- Review the final diff for unrelated/accidental changes before finishing.

## Definition of done

For every change, verify:

1. Front matter and YAML are valid (correct indentation, quoting, no tabs).
2. Filenames and permalinks follow this repo's conventions (`_posts/YYYY-MM-DD-slug.md`; explicit `permalink:` on every `_pages/` file).
3. Any tags/series reuse the existing taxonomy list (see "Topics, categories, and tags") rather than introducing near-duplicate slugs.
4. Links and asset references resolve correctly under the `/weblog` base path (via `relative_url`/`site.baseurl`, or matching the repo's existing hardcoded-`/weblog/` pattern where that's the established style for that file).
5. Navigation (footer / author links) is updated only when the task specifically calls for it.
6. Relevant topic/series landing pages are updated when a new tag or series is introduced.
7. `bundle exec jekyll build` succeeds where the environment allows a compatible Ruby/Bundler toolchain (see the Ruby-version caveat above if it doesn't).
8. Any claims about generated URLs/sitemap behavior are checked against the deployed site where possible, not assumed.
9. No unrelated files were touched and no existing published URL changed.
10. Anything you could not verify (network-restricted build, unreachable Staticman/analytics endpoints, unconfirmed GitHub Pages branch setting, etc.) is explicitly disclosed in your summary rather than silently assumed to work.
