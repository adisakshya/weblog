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

## Review log
| PR | Round | Reviewed SHA | Result | Link |
|---|---|---|---|---|
| #66 | 1 | ea7a1f3 | 1 P2 (fixed bcb1357) | https://github.com/adisakshya/weblog/pull/66#pullrequestreview-5963912540 |
| #66 | 2 | bcb1357 | clean | https://github.com/adisakshya/weblog/pull/66#issuecomment-6989837229 |
| #67 | 1 | d4f88d5 | 3 P1 (fixed 5017d6e) | https://github.com/adisakshya/weblog/pull/67#issuecomment-6990020096 |
| #67 | 2 | 5017d6e | 1 P1 (.pyc, fixed 0b4ab73) | same summary comment |
| #67 | 3 | 0b4ab73 | clean | https://github.com/adisakshya/weblog/pull/67#issuecomment-6990408584 |

## Current state
- Stage: CHILD_60_45_PR_OPENING
- Next action: open PRs for redesign/60-visual-gates (#60) and redesign/45-sitemap-feed (#45) -> redesign/weblog-static; then #61 deploy workflow + rollback docs, #59/#58 functional tests (search, keyboard, prefs persistence, responsive overflow), WEBLOG_DELIVERY.md, final PR to master, Pages deploy + live verification, Slack final.
- Open PRs: none
- Unresolved findings: none
- Last error: none
