# Preservation evidence for #53 / #54

This is preservation infrastructure, not the redesign or completion of #54. PR #62 (`ac85b1c8708e2766283ef509978675c418909166`) supplies the source inventory and initial route tests. Current master is `e812fd40751c11b34b3ee9d8a4cba9c8ca5f2206`. All 69 original tracked files remain byte-identical, including three posts, nine tags, two series, About/Contact/Terms, eight assets and four comments.

## Corrected route date

The #62 inventory inferred July 17 from the filename. Jekyll actually emits `/weblog/2022/07/16/setting-up-an-api-ateway-for-your-microservices.html`: `2022-07-17 00:30:00 +0530` is `2022-07-16T19:00:00Z`. The inventory now converts the front-matter instant to UTC. The original filename, front matter and historical spelling remain untouched. This corrects the inventory to observed output and the #53/#55 contract; it does not change a production URL.

## Repeatable checks

Use the Ruby 3.1 environment installed during onboarding. From the checkout root:

```sh
export PATH=/workspace/.weblog-env/ruby/bin:$PATH
export LANG=C.utf8 TZ=UTC
export BUNDLE_PATH=/workspace/.weblog-env/bundle BUNDLE_FROZEN=true
bundle _2.2.24_ exec jekyll build
PYTHONDONTWRITEBYTECODE=1 python3 tests/test_legacy_inventory.py
PYTHONDONTWRITEBYTECODE=1 python3 tests/test_rendered_routes.py _site
PYTHONDONTWRITEBYTECODE=1 python3 tests/test_rendered_content.py _site
PYTHONDONTWRITEBYTECODE=1 python3 tests/test_preservation_regressions.py
```

`legacy-rendered.json` was independently captured from the original Jekyll `_site` output before adding preservation files. It records normalized content blocks, exact code whitespace, images, anchors, publication timestamps, Contribution occurrences and local asset hashes. It is a legacy fidelity fixture, **not an approved visual baseline**. Future React markup can differ, while the protected semantics must survive. Any intended fidelity exception requires owner review. Never recapture this fixture from the redesign to make it pass.

The semantic checker takes the actual public root (`dist` or `dist/weblog` as appropriate); it does not mix output roots. The route-only checker is retained for compatibility with #62. Source bytes and rendered semantics are separate gates.

Four original comment records are protected byte-for-byte. Only Antoinette's comment belongs to a currently published article. The other three belong to retired `welcome-to-jekyll` / `my-name-is-adisakshya` slugs and are not rendered on current articles. Preserve them without reassigning or inventing published destinations. The source and rendered checks preserve this existing state; they do not claim four visible comments.

There are only three posts with a page size of five, so the current build has no second pagination page. The inventory contains all 27 currently known source-derived routes; generated CSS is checked separately through HTTP. Exhaustive generated feed/SEO/alias work remains for #45/#55. This checkpoint does not establish redesign route compatibility.

## Design and release gates

Approved reference: Lovable project `c12696b6-7bda-47a8-8126-ef17c1071df6`, revision `df8c3ddff9f6f4a182f1a8dc41c729b7d4a5d988`. The preview currently responds HTTP 401; the editor responds HTTP 403 from this machine. Exported source, asset/font capture and owner-reviewed screenshots remain required. No reference baselines or visual parity results exist yet. Do not substitute a newly invented design.

#53 supersedes the mockup's old Jekyll production guidance: the target is fully prerendered React/TanStack, served statically under `/weblog/`. Markdown remains authoritative. The personal website is separate; preserve About here and link Meet Adi to the personal site. Comments and Microsoft Clarity remain preserved pending the recorded launch decisions. Follow #54–#61 in dependency order.

Two independent review rounds must be linked, with findings fixed between rounds. Reviews of preservation checks do not count as completed redesign/release reviews. Never merge to master, deploy production or change Pages settings under this authorization. Present verified release evidence for final owner approval.

## Preservation review evidence

Round one reviewed `d916cb3`: https://github.com/adisakshya/weblog/pull/64#issuecomment-6911481293. It found that replacing link destinations could pass the semantic checker. The fix freezes content link destinations and labels, verifies their occurrence counts, and corrupts a real internal href in a regression test. The code-whitespace negative test now mutates rendered HTML while keeping its expected fixture fixed. Six negative tests pass after these fixes.

The legacy fixture intentionally records the observed duplicate Contribution heading caused by the original template. This is evidence of existing output, not the #57 release acceptance policy: #57 explicitly requires rendering the Contribution section once. A future article implementation PR must separate original authored content from template duplication and document the authorized correction, while retaining the authored section's prose. Do not silently rewrite this legacy fixture as a visual baseline.

Validation on the current machine: locked Jekyll build passed; 69 source files remain byte-identical; all 27 inventoried routes and semantic checks passed; all 27 direct HTTP routes and generated CSS returned nonempty 200 responses through Python's static file server; unknown route returned 404. Source/live image availability and design parity are different checks: remote image decoding, approved fonts and the 12-theme × five-width visual matrix remain unrun pending reference capture. No release readiness claim is made.
