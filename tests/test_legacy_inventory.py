#!/usr/bin/env python3
"""Fail if a migration drops or changes a protected legacy source file."""

import hashlib
import json
import sys
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))
from legacy_inventory import BASE, build  # noqa: E402


# Static assets moved under public/ so the build serves them at the same /weblog/assets/... URLs.
ASSET_MOVES = (("assets/images/", "public/assets/images/"), ("assets/favicon.ico", "public/assets/favicon.ico"))


def current_path(path):
    for old, new in ASSET_MOVES:
        if path.startswith(old):
            return new + path[len(old):]
    return path


def main():
    inventory = ROOT / "docs" / "inventory"
    content = json.loads((inventory / "legacy-content.json").read_text(encoding="utf-8"))
    routes = json.loads((inventory / "legacy-routes.json").read_text(encoding="utf-8"))
    assert (content, routes) == build(), "baseline inventory changed; inspect and regenerate deliberately"
    assert content["baseline_commit"] == routes["baseline_commit"] == BASE
    counts = Counter(entry["kind"] for entry in content["files"])
    assert counts["post"] == 3 and counts["tag"] == 9 and counts["series"] == 2
    assert counts["page"] == 3 and counts["comment"] == 4 and counts["asset"] == 8
    assert len(content["files"]) == 69 and len(routes["routes"]) == 27
    paths = [entry["path"] for entry in content["files"]]
    urls = [entry["route"] for entry in routes["routes"]]
    assert len(paths) == len(set(paths)) and len(urls) == len(set(urls))
    assert {"/weblog/", "/weblog/about/", "/weblog/2022/07/16/setting-up-an-api-ateway-for-your-microservices.html"} <= set(urls)
    removed = json.loads((inventory / "intentional-removals.json").read_text(encoding="utf-8"))["removed"]
    protected = 0
    for entry in content["files"]:
        if entry["kind"] == "site-source":
            continue  # Jekyll infrastructure (config, layouts, includes, sass, Gemfile...) is replaced by the React build
        if entry["kind"] == "asset" and "/weblog/" + entry["path"] in removed:
            continue  # theme CSS/JS, removal documented in intentional-removals.json
        current = ROOT / current_path(entry["path"])
        assert current.is_file(), f"missing legacy file: {current}"
        raw = current.read_bytes()
        assert len(raw) == entry["bytes"] and hashlib.sha256(raw).hexdigest() == entry["sha256"], f"changed legacy file: {current}"
        protected += 1
    assert protected == 25, f"expected 25 protected content/asset files, checked {protected}"
    assert (ROOT / "LICENSE").is_file(), "LICENSE must be kept"
    print(f"Preserved {protected} protected content/asset files byte-for-byte (of {len(paths)} baseline files); {len(urls)} routes inventoried; baseline {BASE}.")


if __name__ == "__main__":
    main()
