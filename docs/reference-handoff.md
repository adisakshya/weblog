# Legacy preservation checkpoint for #54

Baseline: `e812fd40751c11b34b3ee9d8a4cba9c8ca5f2206` on `master`.

`docs/inventory/legacy-content.json` records the path, bytes, SHA-256, raw front matter, and referenced external URLs for every one of the 69 tracked files at that commit. `legacy-routes.json` records 27 known routes, including all three original posts, nine tags, two series, About, Contact, Terms, home, 404, and eight local assets. Four Staticman comment YAML files are protected by the source inventory. The historical `api-ateway` spelling and `/weblog/` prefix are intentional.

Run `python3 tests/test_legacy_inventory.py` to compare every byte of current source with the baseline. After building the site, run `python3 tests/test_rendered_routes.py _site` (or pass a React static output directory) to verify these routes exist. Route existence alone does not establish content fidelity; a future migration PR must also compare rendered body text, dates, metadata, images, and comments, and show visual and responsive evidence. Do not merge or deploy a migration until that evidence passes and two review rounds are complete.

The approved redesign reference is Lovable project `c12696b6-7bda-47a8-8126-ef17c1071df6`, revision `df8c3ddff9f6f4a182f1a8dc41c729b7d4a5d988`. This repository's current source remains authoritative for content and URLs. The reference source, assets, fonts, and screenshots still need capture before #54 is complete. Then #55–#61 can proceed in dependency order toward a static React preview. Keep the existing About page, comments and Microsoft Clarity. No production deployment or Pages settings change is authorized here.
