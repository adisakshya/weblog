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
    for entry in content["files"]:
        current = ROOT / entry["path"]
        assert current.is_file(), f"missing legacy file: {current}"
        raw = current.read_bytes()
        assert len(raw) == entry["bytes"] and hashlib.sha256(raw).hexdigest() == entry["sha256"], f"changed legacy file: {current}"
    print(f"Preserved {len(paths)} source files, {len(urls)} routes, and all content counts from {BASE}.")


if __name__ == "__main__":
    main()
