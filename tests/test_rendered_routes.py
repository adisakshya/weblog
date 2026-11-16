#!/usr/bin/env python3
"""Check every frozen legacy content route in an existing static output directory."""

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def main():
    if len(sys.argv) != 2:
        raise SystemExit("Usage: python3 tests/test_rendered_routes.py PATH_TO_STATIC_OUTPUT")
    output = Path(sys.argv[1]).resolve()
    assert output.is_dir(), f"missing output directory: {output}"
    routes = json.loads((ROOT / "docs/inventory/legacy-routes.json").read_text(encoding="utf-8"))["routes"]
    for entry in routes:
        route = entry["route"].removeprefix("/weblog/")
        relative = (route + "index.html") if route.endswith("/") or not route else route
        candidates = [output / relative, output / "weblog" / relative]
        assert any(path.is_file() for path in candidates), f"missing rendered route: {entry['route']}"
    print(f"Found {len(routes)} legacy routes in {output}.")


if __name__ == "__main__":
    main()
