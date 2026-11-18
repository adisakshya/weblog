# Weblog redesign — run ledger

Durable checkpoint for the Claude Code run. Read this first when resuming. Single writer: the Claude Code session recorded below.
Brief: "Weblog development launch for Claude Code" (19 Nov 2026). Owner: adisakshya.

## Approved scope (owner answers, 18/19 Nov 2026)
- Reproduce the approved Lovable design (rev `df8c3ddff9f6f4a182f1a8dc41c729b7d4a5d988`) as a static, prerendered site at `https://adisakshya.github.io/weblog/`. Jekyll replacement permitted; Markdown-in-GitHub authoring kept; all posts/pages/tags/series/images/metadata/historical URLs preserved.
- Comments UI + Staticman omitted; comment data kept in `_data/comments` unrendered.
- Analytics: BOTH Universal Analytics and Microsoft Clarity dropped; follow-up issue #65 (re-add Clarity).
- sitemap.xml + feed.xml: ADD. Agustina masthead font: keep the CDN link (do not self-host).
- Branching: integration branch `redesign/weblog-static`; one child branch per issue; each child merges into the integration branch only after two clean Codex rounds; the integration branch goes to `master` in one final PR.
- Pages source switched to "GitHub Actions" by the owner (cannot be read back by this session).
- Resume watchdog: scheduled task `trig_01NLtBbTpigr3a5njPbb4vfT`, hourly at :17, bound to session `session_01SYESrTiDRGeRoD1ZZZ2RfS` (unverified for quota-resume).
- Slack interim updates allowed to #agent-shifts-summary (C0BLSNJJC00).

## Sources
- Lovable ZIP sha256 `00bea465382285b73b2ab3d17b76c1590ff0ebce35a61765dac4cf4959abaeea` (259 entries). Revision `df8c3ddff9f6f4a182f1a8dc41c729b7d4a5d988`.
- Legacy baseline: `master` @ `e812fd40751c11b34b3ee9d8a4cba9c8ca5f2206`.
- Prior preservation work reused (reviewed twice by Codex): PR #64 / branch `redesign/54-preservation-evidence` @ `9f2257f`.

## Environment limits (observed)
- Cannot see remaining Claude quota/reset time. Cannot read/modify Pages settings or branch protection via the API proxy.
- Local Ruby is 3.3.6 (Jekyll 3.9 needs the `tainted?` shim, issue #48). Legacy baseline comes from PR #64 fixtures and the live site.
- Network allowlist added to the Default environment for this run (remove at end): adisakshya.github.io, lovable preview, 7 cover hosts, res.cloudinary.com, fonts.cdnfonts.com.

## Stage log
| When (UTC) | Stage | Note |
|---|---|---|
| 2026-11-18 19:45 | PREFLIGHT_DONE | Source readable, covers recovered 10/10, Codex connector observed on PR #64. |
| 2026-11-18 20:05 | #54_PR_OPENED (#66) | Reference screenshots (50) + covers + legacy fixtures on `redesign/54-reference-freeze`; raw Lovable export on branch `reference/lovable-df8c3dd` @ aa7e8c1. |
| 2026-11-18 20:20 | #54 MERGED (#66 -> cdb2b83) | Codex R1 on ea7a1f3: 1 P2 (capture-visual covers layout) fixed in bcb1357; R2 on bcb1357: no findings (receipt 19:54Z). |
| 2026-11-18 20:55 | #55_PR_OPENED (#67) | Head d4f88d5. Local: typecheck/lint/25 unit/preservation/build/route manifest/24 e2e green. Found+fixed: prerender ?view= overwrote index.html. |
| 2026-11-18 20:35 | #55+#56 MERGED (#67 -> 13848ac) | R1 d4f88d5: 3xP1 fixed (baseurl, about/blogging-101 routes, HTML sanitization); R2 5017d6e: 1xP1 fixed (tracked .pyc); R3 0b4ab73: clean. CI green. |
| 2026-11-18 20:40 | #60/#45 branches ready | visual gate 50/50 vs approved reference (6 shots allowed: kramdown apostrophes); sitemap+feed generated + tested. PRs next. |
| 2026-11-18 20:55 | #45 MERGED (#69 -> 181b197) | R1+R2 on e16f5b4 clean; CI green. |
| 2026-11-18 20:55 | #68/#70/#71 IN REVIEW | #68 (visual gate; CI tolerance 0.12 after cross-env measurement 0.65-6.9%), #70 (73 e2e tests; fixed lightbox DOM wipe, ?view= hydration #418, missing h1), #71 (deploy workflow + live-check + rollback; legacy/jekyll-e812fd4 branch = rollback ref, tag push is 403). |
| 2026-11-18 21:05 | #70 MERGED (-> f91d99b) | R1+R2 clean on 5bd77f2; CI green (99 browser tests on the GitHub runner too). Found+fixed: lightbox DOM wipe (React 19 innerHTML), ?view= hydration #418, missing home h1. |
| 2026-11-18 21:05 | #68 R2 P1 -> fix c75c166 | Codex: 12% pixel tolerance would accept a blank page. Replaced by structural block comparison + negative fixtures from all 50 reference shots (reject: blank/erased/inverted/shifted; accept: noise/1px shift/blur). CI calibration run in progress. |
| 2026-11-18 21:05 | #71 R1 P1 -> fixed 5d9a14e | stacked before #69 (missing test_feeds.py); rebased. R2 requested. |
| 2026-11-18 21:25 | #71 MERGED (-> a9ebbea) | 4 rounds: P1 each in R1-R3 (missing test_feeds.py via stacking; live-check h1/canonical false-pass; HTML-at-bundle-URL false-pass), all fixed with fault-injection tests; R4 clean. |
| 2026-11-18 21:25 | #68 MERGED (-> e1e0ce1) | R2 P1 (12% tolerance would accept blank page) fixed with structural comparison + per-shot limits calibrated on the GitHub runner + negative fixtures from all 50 shots; R3 clean; CI green. |
| 2026-11-18 22:17 | #72 MERGED (fdbec00) | R6 clean on d90b4b7 + CI green. Review found 7 P1/P2 across rounds, all fixed; the authoring fixture now runs all release gates (found + fixed a NODE_TEST_CONTEXT false-pass in my own gate). |
| 2026-11-18 21:25 | #72 IN REVIEW | WEBLOG_DELIVERY.md + authoring-path test (R1: P1 chromium install order + P2 hard-coded feed count, both fixed; R2 running on 0ac6d20). |

## Review log
| PR | Round | Reviewed SHA | Result | Link |
|---|---|---|---|---|
| #66 | 1 | ea7a1f3 | 1 P2 (fixed bcb1357) | https://github.com/adisakshya/weblog/pull/66#pullrequestreview-5963912540 |
| #66 | 2 | bcb1357 | clean | https://github.com/adisakshya/weblog/pull/66#issuecomment-6989837229 |
| #67 | 1 | d4f88d5 | 3 P1 (fixed 5017d6e) | https://github.com/adisakshya/weblog/pull/67#issuecomment-6990020096 |
| #67 | 2 | 5017d6e | 1 P1 (.pyc, fixed 0b4ab73) | same summary comment |
| #67 | 3 | 0b4ab73 | clean | https://github.com/adisakshya/weblog/pull/67#issuecomment-6990408584 |
| #69 | 1 | e16f5b4 | clean | https://github.com/adisakshya/weblog/pull/69#issuecomment-6990440736 |
| #69 | 2 | e16f5b4 | clean | https://github.com/adisakshya/weblog/pull/69#issuecomment-6991343228 |
| #68 | 1 | 44aed53 | clean | https://github.com/adisakshya/weblog/pull/68#issuecomment-6990437103 |
| #71 | 2 | 5d9a14e | 1 P1 (route h1/canonical; fixed 68add78) | https://github.com/adisakshya/weblog/pull/71#discussion_r4620760873 |
| #71 | 3 | 68add78 | 1 P1 (HTML at bundle URLs; fixed a5ba17f) | https://github.com/adisakshya/weblog/pull/71#discussion_r4620907413 |
| #71 | 4 | a5ba17f | clean | https://github.com/adisakshya/weblog/pull/71#issuecomment-6991801702 |
| #68 | 3 | 725da34 | clean | https://github.com/adisakshya/weblog/pull/68#issuecomment-6992027784 |
| #72 | 1 | 08b49d7 | P1 chromium order + P2 feed count (fixed 0ac6d20) | https://github.com/adisakshya/weblog/pull/72#pullrequestreview-5965367135 |
| #72 | 2 | 0ac6d20 | P2 curated gates hard-coded (fixed 8e63112; plus visual gate vs added content) | https://github.com/adisakshya/weblog/pull/72#pullrequestreview-5965400177 |
| #72 | 3 | 8e63112 | 2 P2 (cover formats; visual fixtures from baseline; fixed 8391c61) | https://github.com/adisakshya/weblog/pull/72#pullrequestreview-5965637020 |
| #72 | 4 | 8391c61 | P1 client-nav on fixture + P2 .jpeg MIME (fixed 534a786) | https://github.com/adisakshya/weblog/pull/72#pullrequestreview-5965732669 |
| #72 | 5 | 534a786 | P2 upper-case cover ext (fixed d90b4b7) | https://github.com/adisakshya/weblog/pull/72#pullrequestreview-5965874344 |
| #72 | 6 | d90b4b7 | clean | https://github.com/adisakshya/weblog/pull/72#issuecomment-6993106393 |
| #70 | 1 | 5bd77f2 | clean | https://github.com/adisakshya/weblog/pull/70#issuecomment-6991346034 |
| #70 | 2 | 5bd77f2 | clean | https://github.com/adisakshya/weblog/pull/70#issuecomment-6991415571 |
| #68 | 2 | b7656cc | 1 P1 (tolerance accepts blank page; fixed c75c166) | https://github.com/adisakshya/weblog/pull/68#discussion_r4620715938 |
| #71 | 1 | b083fc1 | 1 P1 (missing test_feeds.py; fixed 5d9a14e) | https://github.com/adisakshya/weblog/pull/71#discussion_r4620712469 |

## Current state
- Stage: ALL_CHILDREN_MERGED; FINAL_VERIFICATION on integration head fdbec00
- Next action: strict verification on fdbec00; open final PR redesign/weblog-static -> master (AGENTS.md rules; 2 Codex rounds), merge, watch Deploy workflow, run live-check on production, Slack final, remove allowlist hosts from the Default env, disable watchdog trigger.
- Open PRs: none (children #66, #67, #68, #69, #70, #71, #72 merged)
- Unresolved findings: none
- Last error: none
