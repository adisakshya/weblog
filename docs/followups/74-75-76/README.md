# Follow-up #74, #75, #76 — masthead and header actions, reading controls, footer

Evidence for the draft PR. Design reference: Lovable project `a72cd5b7-48f1-4dcc-8ebb-6e0c7dcc6a6f`, revision `38e69906a56827ebbda4a70ac03ffd3d5b2d25f7`
(source read through the Lovable connector; see "Gaps" for what could not be fetched). Screenshots are in `screenshots/`, captured from the
built static site served under `/weblog/` with Source Serif 4 and IBM Plex Sans loaded (Agustina, the script face, could not be fetched here).

## #75 — reading controls: reproduction and cause

Reproduced on the built site, on an actual article (`/weblog/2022/02/01/introduction-to-api-gateway.html`), in desktop Chromium and in a
touch-emulated phone, by driving the real Appearance menu and reading computed styles.

| What was checked (before the fix) | Result |
|---|---|
| Serif ↔ Sans-serif changes the computed article body `font-family` | works (Source Serif 4 ↔ IBM Plex Sans) |
| Standard / Comfortable / Large change the computed body `font-size` | works (18 / 20 / 23px at the default root size) |
| Applies to paragraphs, list items and blockquotes on all three articles | works |
| Persists across reload, client navigation and direct entry | works |
| **The menu shows which option is selected** | **no: the selected chip looks exactly like the others** |
| On a touch screen, which chip looks selected | **the last-tapped one (sticky `:hover`), not the selected one** |
| An unknown stored value (`{"size":"huge"}`) | page falls back to the default, but the menu shows **no** option selected |
| Keyboard focus on the last group of a short phone panel | the focused chip can be partly clipped at the panel edge |

So the article typography did change; the controls looked broken because the menu gave no visible feedback, and on a phone the only highlighted
chip was often the wrong one.

**Cause.** `PrefsMenu` marked the selected chip with Tailwind utilities (`has-[:checked]:bg-…`, `…:border-…`). Those are emitted inside
`@layer utilities`, and `.j-ghost` (in `src/styles/journal.css`, imported unlayered) sets `background` and `border` itself. Unlayered rules beat
layered ones regardless of specificity, so the selected styles never applied (computed `background-color` was `rgba(0, 0, 0, 0)` for the
checked and the unchecked chip alike). The radios were also `sr-only`, so nothing else showed the selection. `.j-ghost:hover` then stuck on the
last-tapped chip on touch devices.

**Fix.** Visible radios plus an unlayered `.j-pref-choice:has(:checked)` rule (as in the mockup); `:hover` only where a pointer can hover;
`scroll-margin` so keyboard focus keeps the whole chip in view; stored values are validated per field (same stored shape) and applied on load.

**Not reproduced.** WebKit/Safari and Firefox (only Chromium is installed here), and the live site itself (see "Gaps").

## #74 — measurements (real Source Serif 4; real browser, built site)

| viewport | masthead face / size | text width | available | spare | lines | right edge of the controls |
|---|---|---|---|---|---|---|
| 320px | Source Serif 4 18px | 282.3px | 288px | 5.8px | 1 | 304.0 of 320 |
| 375px | Source Serif 4 20px | 313.6px | 343px | 29.4px | 1 | 359.0 of 375 |
| 390px | Source Serif 4 20px | 313.6px | 358px | 44.4px | 1 | 374.0 of 390 |
| 430px | Source Serif 4 23px | 360.6px | 398px | 37.4px | 1 | 414.0 of 430 |
| 768px | Agustina 27px (fallback face in this capture) | 382.7px | 720px | 337.3px | 1 | 744.0 of 768 |
| 1440px | Agustina 27px (fallback face in this capture) | 382.7px | 698px | 315.3px | 1 | 1272.0 of 1440 |

No horizontal overflow at any width; Meet Adi, Search and Appearance are each at least 44px tall; the header also holds at 240, 195 and 130px
(page zoom of 200%–300% on a phone) and with the root font size at 200%.

## Tests added or extended

- `tests/e2e/reading-controls.test.mjs` — computed typography for all six font × size combinations, immediately; whole-article coverage;
  persistence across client navigation, reload and direct entry (and before first paint); selection visibility on mouse and touch in 11 themes;
  keyboard; three short phone viewports; stored-value compatibility; blocked storage (writes refused, and access throwing).
- `tests/e2e/header-footer.test.mjs` — masthead and controls at 320/375/390/430/768/1440 and under zoom; Meet Adi destination and fill; keyboard
  order and focus rings; footer grouping, exact destinations, `rel`, touch targets, mobile and desktop layout, keyboard order.
- `tests/e2e/appearance.test.mjs` — contrast probes for the new header and footer surfaces in every theme.
- `src/lib/prefs.test.ts` — stored-value compatibility and fallbacks.
- `tests/visual-body.test.mjs` — the body-region comparison (below).

## Visual gate

The header and footer changed on purpose, so the frozen reference screenshots no longer match as whole pages (2 of 50 matched). The reference was
**not** regenerated from this site. See `docs/redesign/README.md`, "Body-region comparison": every page body (`<main>`) still has to match the
approved reference (46 of 46 in the tolerant mode); the header, footer and the four panel shots are covered by the browser tests above.

## Gaps and open decisions

- The design preview (`id-preview--a72cd5b7-….lovable.app`) and the live site were not reachable from this environment. The design was read from
  its source at the pinned revision plus its own 1920×1080 screenshot (`screenshots/design-lovable-38e6990-1920x1080.png`).
- The Agustina script face (desktop masthead) loads from a CDN that is blocked here, so the desktop masthead was measured and captured with a
  fallback face. At 640px and above the masthead has more than 300px to spare, but the real face was not rendered.
- At 320px the masthead has 5.8px to spare with the real face; it is `nowrap`, so a wider rendering would run into the gutter before it could
  clip, but this is the tightest case.
- The mockup also sets `min-height: 44px` on every `j-btn` / `j-ghost`, which would make the home view toggles (33px) and the "Read the article"
  button (40px) 44px tall. Not applied: it is outside #74–#76 and changes the home page. **Decision for Adi.**
- CI's first run found that with the web fonts unavailable (the runner falls back to DejaVu Sans) the header controls overlapped at 320px. The
  header actions are now a wrapping flex row (one row when they fit, two when they do not), and `header-footer.test.mjs` forces a wide fallback
  face at all six widths (it fails on the previous CSS at 320px).
- Masthead line heights are whole pixels (25 / 28 / 32 / 40px, the mockup's 1.4 / 1.5 rounded) so the header height is not fractional.
- Short footer links ("Home", "Index", "Email") are 35–39px wide and 44px tall: above the WCAG 2.2 AA 24px minimum, below 44px wide.
- Browsers other than Chromium were not run.
