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
| 2026-11-18 20:05 | #54_PR_OPENING | Reference screenshots (50) + covers + legacy fixtures on `redesign/54-reference-freeze`; raw Lovable export on branch `reference/lovable-df8c3dd` @ aa7e8c1. |

## Current state
- Stage: CHILD_54_REVIEW
- Next action: open PR for `redesign/54-reference-freeze` -> `redesign/weblog-static`; wait for Codex round 1; then #55 static build.
- Open PRs: none
- Unresolved findings: none
- Last error: none
