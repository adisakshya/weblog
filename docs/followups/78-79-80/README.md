# Follow-up #78, #79, #80 — pinned header, reading controls on articles only, compact footer

Evidence for the draft PR. Design reference: Lovable project `a72cd5b7-48f1-4dcc-8ebb-6e0c7dcc6a6f`, revision
`2f72c13e6ef7ef732eedecca4719351a3fd8058c` (supersedes the earlier mockups). The design source was read through the Lovable connector
(`Shell.tsx`, `PrefsMenu.tsx`, `prefs.ts`, `journal.css`, `AGENTS.md`) and its own 1920×1080 screenshot was fetched; the preview URL itself
was not reachable from this environment (network policy), see "Gaps". Screenshots are in `screenshots/`, taken from the built static
site served under `/weblog/` with Source Serif 4 and IBM Plex Sans loaded (Agustina, the desktop script face, could not be fetched).

## What changed

### #78 — pinned header
- `.j-header` is `position: sticky; top: 0` on mobile and desktop, opaque, with a bottom border and a theme-aware shadow once condensed
  (`color-mix` of the theme's own foreground, so it differs per theme).
- It condenses past 64px of scroll and is restored only within 8px (hysteresis; the header changes height by 20–28px, so its own
  height change can never flip the state). Condensed: padding 16→8px, gap 12→6px, desktop masthead 27→23px. The full single-line
  masthead, Meet Adi, Search and Appearance stay visible in both states.
- **No layout jump.** Chromium's scroll anchoring does not compensate for the header shrinking (measured: the page jumped by 22px on
  phones and 20px on desktop at the threshold with the mockup's approach). The condensed header therefore keeps exactly the space it
  gave up as `margin-bottom` (22px < 640px, 28px 640–1023px, 20px ≥ 1024px — the measured differences), animated with the same
  duration and easing, so the content never moves. The reserved space sits behind the pinned header once scrolled.
- `--j-header-h` (published by the header, ResizeObserver) feeds `html { scroll-padding-top: calc(var(--j-header-h) + 12px) }`, so
  anchors, headings and keyboard focus land below the header. The CSS also carries the real full height per breakpoint (122 / 125 /
  129 / 137 / 81px) so a direct load on `/article#section` is already correct before scripts run; if the real header differs (controls
  wrapped because the web fonts are missing) the target is placed again after hydration. The prose headings' own
  `scroll-margin-top: 5rem` was removed (it would have doubled the offset).
- Specificity is raised (`.journal.j-shell > .j-header`) because the superhero themes set `position: relative` on every shell child.
- Reduced motion: the existing `prefers-reduced-motion` rule disables the transitions (and the margin animation with them).
- Safe areas: `max(16px, env(safe-area-inset-top))` / `max(8px, …)` header padding, left/right/bottom insets on the content padding.

### #79 — Appearance
- The Article font control is gone. `Prefs` is `{ theme, size, width }`; the article font is the default serif everywhere.
- An older saved payload (`{"font":"sans", …}`) is still read: its `font` key is ignored (the article is serif), theme/size/width are
  honoured, and the key is dropped the next time the reader saves a choice. The pre-paint boot script applies the same three choices.
- Text size and Article width render only when the matched route is the article route **and** its match resolved (`status ===
  "success"`), so a not-found article URL reached by client navigation offers Theme only. Theme (all 12) is available everywhere.
- Saved size and width still apply to the document everywhere (as in the mockup), so they are in place when the reader returns to an
  article. **Consequence to know:** About/Contact/Terms use the same text size, so a reader who saved "Large" sees larger text there but
  can only change it on an article.

### #80 — footer
- Follow Adi and Explore headings are `1rem` (16px at the default root size; 32px at a 200% root). Groups sit side by side on desktop
  (64px apart) and stack on mobile; Home, Subjects, Index are one horizontal row that wraps only when it must.
- LinkedIn keeps its accent fill; Twitter/X `#0b0b0d` and GitHub `#24292f` are identical filled pills (44px minimum height, same
  padding, radius and type). Labels, icons and destinations are unchanged.
- Copyright and **Made with love. Open source.** sit together under a single divider, left-aligned; "Open source" is the only credit
  link and goes to `https://github.com/adisakshya/weblog`.
- Contact, Email and Terms & policies are no longer in the footer; the `/contact/` and `/terms/` routes and their content are
  untouched (and still prerendered, in the sitemap and in the legacy inventory). **Nothing else on the site links to them now**; they
  are reachable by URL only.
- One deliberate difference from the mockup: the pill ring is `color-mix(… 60%)` instead of 50%. At 50% the X pill's boundary against
  the Deep Sea footer measured 2.77:1; at 60% every theme is at least 3.68:1.

## Verification (built static site under `/weblog/`)

| Area | Tests |
|---|---|
| Pinned, one-line masthead, all four controls, condense/restore, `--j-header-h` | `tests/e2e/pinned-header.test.mjs` at 320 / 390 / 1440 on home and an article |
| Threshold jitter and layout jump | 3px steps down and up (one flip each way, stable in the 9–64px band); content position compared across the threshold (≤ 2px) |
| Anchors and focus | direct load on `#heading` and in-page hash jumps below the header at 3 widths × 2 articles; 30× Shift+Tab up a long article never focuses under the header; skip link |
| Every theme | sticky, opaque, bordered, shadowed in all 11 concrete themes; every route type pinned |
| Reduced motion / safe areas | transition 0s with `reduce` (and still condenses), 0.2s without; built CSS carries all four `env(safe-area-inset-*)`; designed padding with no inset |
| Popovers on short screens | 320×568, 390×500, 667×375 with the header condensed: Appearance opens below the header, fits, scrolls to its last control, does not move the page; Search dialog fits |
| Reading controls | `tests/e2e/reading-controls.test.mjs`: 3 articles show Theme + Text size + Article width and no font; 9 non-article routes show Theme only; unknown URLs; client navigation away and back; old `font: "sans"` payload; computed font/size/measure for every size × width; persistence across reload, navigation, direct entry; blocked storage |
| Footer | `tests/e2e/header-footer.test.mjs`: exact copy and destinations, no Contact/Email/Terms, 16px headings, identical pills and exact fills, contrast and boundaries in 11 themes, layout at 320 / 390 / 1440, wrapping at 130–195px and 200% text, touch targets, keyboard order |
| Unit | `src/lib/prefs.test.ts` (legacy payload, boot script, storage) |

Two things the new tests found and fixed during this work: the header's own condensing made the page jump by 20–28px, and the footer
pills overflowed at 130px (page zoom).

## Gaps and notes
- The Lovable preview URL and the live site were not reachable from this environment; the design was compared through its source at the
  pinned revision plus its own 1920×1080 screenshot (`screenshots/design-lovable-2f72c13-1920x1080.png`, ours next to it:
  `home-1920x1080.png`).
- Agustina (the desktop script masthead face, from a CDN blocked here) was not rendered: desktop screenshots use a fallback face.
- Safe-area insets cannot be emulated in headless Chromium; they are checked as CSS (the built stylesheet carries them) and the
  designed padding is checked with no inset. A device with a notch or home indicator was not run.
- Only Chromium was run (no Safari / Firefox). Safari has no scroll anchoring at all, which is why the layout-jump fix does not rely on it.
- Playwright's `locator.click()/tap()` scrolls an element inside a sticky header "into view" by its static position and moves the page;
  the new tests tap/click the element where it is actually drawn (a person does the same).
- On widths below 1024px the pinned header is 100–137px tall (condensed 100–109px): about a third of a landscape phone's height
  (667×375). That is the approved design (two rows), kept as is.
- Sandbox-only: the extension-pack article embeds `res.cloudinary.com` images, which this sandbox blocks, so its "loads cleanly"
  browser test and the authoring-path test fail here (on `master` too) and pass in CI.
