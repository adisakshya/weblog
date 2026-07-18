# weblog

The personal blog of **Adisakshya Chauhan** — a Jekyll site built on the [Minimal Mistakes](https://mmistakes.github.io/minimal-mistakes/) theme and hosted on GitHub Pages.

**Live site:** [adisakshya.github.io/weblog](https://adisakshya.github.io/weblog/)

## Features

- Posts organized by **tags** and **series**, each with a dedicated landing page (`/tags/<slug>/`, `/series/<slug>/`)
- Light/dark theme toggle (persisted via `localStorage`)
- Built-in site search (Minimal Mistakes' Lunr-based search)
- Threaded comments via [Staticman](https://staticman.net/) — comments are stored as static YAML files and rendered at build time, no third-party comment widget
- Home page pagination (`jekyll-paginate`)

## Tech stack

- [Jekyll](https://jekyllrb.com/) `3.9.0` (pinned via the `github-pages` gem, so the site builds with the exact toolchain GitHub Pages itself uses)
- [Minimal Mistakes](https://mmistakes.github.io/minimal-mistakes/) `4.22.0`, loaded as a **remote theme** (`remote_theme: mmistakes/minimal-mistakes@4.22.0` in `_config.yml`) — not vendored, not the gem-based `theme:` directive
- `jekyll-paginate`, `jekyll-include-cache`
- Sass (custom partials under `_sass/custom/`), vanilla JavaScript
- Staticman v2 for comments

## Repository structure

```
_config.yml       Site configuration (title, url/baseurl, theme, author, footer, comments, pagination)
staticman.yml     Staticman comment-bot configuration
_posts/           Blog posts (YYYY-MM-DD-title.md)
_pages/           Durable pages, plus tag/series landing pages
  _pages/tags/       One page per tag
  _pages/series/     One page per post series
_layouts/         Layout overrides on top of the remote theme
_includes/        Include overrides (footer, author profile, comments, series/tag listings, ...)
_sass/            Theme entry point + custom Sass partials
_data/comments/   Generated Staticman comment data
assets/           CSS, JS, favicon, and in-repo images
```

See [`CLAUDE.md`](./CLAUDE.md) for a full breakdown of how these pieces fit together, including known caveats and stale integrations.

## Prerequisites

- Ruby + [Bundler](https://bundler.io/)

> **Note:** `Gemfile.lock` pins `nokogiri 1.11.3`, which requires **Ruby < 3.1**. Use a compatible Ruby version (e.g. via `rbenv`/`rvm`) if `bundle install` fails on a newer Ruby.

## Installation and local development

```bash
# Install dependencies
bundle install

# Run the site locally with live reload
bundle exec jekyll serve

# Build only (outputs to _site/)
bundle exec jekyll build

# Clean generated output
bundle exec jekyll clean
```

Because the site is configured with `baseurl: "/weblog"`, the local preview lives under that path — open:

```
http://127.0.0.1:4000/weblog/
```

There is no automated test suite or linter configured in this repository.

## Adding a post

Create `_posts/YYYY-MM-DD-your-title.md` with front matter like:

```yaml
---
title: "My New Post Title"
date: 2026-07-18 09:00:00 +0530
tags: [docker]
excerpt: One or two sentence summary shown in listings.
comments: true
---
```

`layout`, `show_date`, `read_time`, `footnotes`, and related defaults are already applied sitewide via `_config.yml` — no need to repeat them. Reuse existing tag slugs where possible (see `_pages/tags/` for the current list) rather than introducing near-duplicate variants.

## Pages, topics, and series

- **Pages** (About, Contact, Terms, etc.) live in `_pages/` with an explicit `permalink:`.
- **Topics/tags**: add the tag to a post's `tags:` array, and add a matching landing page at `_pages/tags/<slug>.md` (`layout: tag`, `taxonomy: <slug>`).
- **Series**: set `series: <series-slug>` on each post in the series, and add a landing page at `_pages/series/<series-slug>.md` (`layout: series`, `taxonomy: <series-slug>`). Previous/next links, the "part of a series" block, and the series index on the home page are all generated automatically from these front matter fields — no extra wiring needed.

Full conventions (front matter fields, taxonomy rules, navigation behavior) are documented in [`CLAUDE.md`](./CLAUDE.md).

## Configuration overview

Site-wide settings live in `_config.yml`: title/description, `url` + `baseurl` (`https://adisakshya.github.io` + `/weblog`), the remote theme reference, enabled plugins, author metadata, footer links, comments provider, and pagination (`paginate: 5`).

## Comments and integrations

Comments use **Staticman v2**, configured in `staticman.yml` and `_config.yml`, posting to a self-hosted endpoint. Approved comments are committed as YAML under `_data/comments/<post-slug>/`. The site also loads Google Analytics and Microsoft Clarity for basic analytics (see `_includes/head/custom.html`).

## Sitemap and deployment

The repository has no explicit `jekyll-sitemap` entry in `_config.yml`'s `plugins:` list and no manual `robots.txt`/`sitemap.xml`; `jekyll-sitemap` is present only as a transitive gem dependency. Deployment is classic branch-based GitHub Pages (no GitHub Actions workflow in this repo) from the `master` branch. See [`CLAUDE.md`](./CLAUDE.md) for the full nuance around what's actually active locally vs. on GitHub's hosted build.

## Documentation

For a deeper operating guide — repo conventions, taxonomy rules, theme customization, and known stale/unverified integrations — see [`CLAUDE.md`](./CLAUDE.md).

## License

[MIT](./LICENSE) © Adisakshya Chauhan

## Links

- [Twitter](https://twitter.com/adisakshya)
- [GitHub](https://github.com/adisakshya)
- [LinkedIn](https://www.linkedin.com/in/adisakshya)
