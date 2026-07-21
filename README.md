# Adisakshya Chauhan's blog

## Local development

### Prerequisites

- Ruby 3.1
- Bundler
- An available UTF-8 locale

Ruby 3.1 is the only supported Ruby release for this dependency set. Nokogiri
1.18.10 requires Ruby 3.1 or later, while Liquid 4.0.3 calls APIs that Ruby 3.2
removed.

Install the locked dependencies from the repository root:

```sh
bundle install
```

### Build the site

Jekyll must run under a UTF-8 locale to compile the site's Sass assets. For
example, if your operating system provides the locale as `C.utf8`, run:

```sh
LANG=C.utf8 bundle exec jekyll build
```

The exact UTF-8 locale name is operating-system dependent. Check the locales
available on your system (for example, with `locale -a`) and set `LANG` to an
available UTF-8 locale. If your shell already uses one, the usual build command
is sufficient:

```sh
bundle exec jekyll build
```

The generated site is written to `_site/`.

### Serve the site

Start Jekyll's local development server under an available UTF-8 locale:

```sh
LANG=C.utf8 bundle exec jekyll serve
```

When the shell already uses a UTF-8 locale, use:

```sh
bundle exec jekyll serve
```
