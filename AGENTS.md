# WeBlog redesign

Follow parent #53 and #54–#61. Current Markdown, front matter, images, comments and historical `/weblog/` URLs are authoritative. Preserve About and `api-ateway`, including the UTC July 16 permalink. Read `docs/reference-handoff.md` for preservation commands and the deferred launch decisions.

PR #62 is preservation evidence, not implemented redesign. Pin and run the exact approved Lovable revision before implementing its design. The target is a prerendered React/TanStack static site; older mockup Jekyll production instructions are superseded. Do not alter the Lovable project or invent visual baselines. Ask the owner through pop-ups for unresolved product/design decisions.

Use existing isolated checkout. Keep work in scoped PRs targeting `redesign/static-react`; request two independent review rounds and resolve findings between rounds. No merge to master, production deployment or Pages setting changes. Final release needs owner approval. Do not commit generated caches or publish source/reference/test files as public artifacts.
