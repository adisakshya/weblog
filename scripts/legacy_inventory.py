#!/usr/bin/env python3
"""Freeze the legacy Jekyll source and routes before a redesign."""

from datetime import datetime, timezone
import hashlib
import json
import re
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BASE = "e812fd40751c11b34b3ee9d8a4cba9c8ca5f2206"
URL = re.compile(r"https?://[^\s\]>)\"']+")


def git(*args):
    return subprocess.check_output(["git", *args], cwd=ROOT)


def kind(path):
    if path.startswith("_posts/"):
        return "post"
    if path.startswith("_pages/tags/"):
        return "tag"
    if path.startswith("_pages/series/"):
        return "series"
    if path.startswith("_pages/"):
        return "page"
    if path.startswith("_data/comments/"):
        return "comment"
    if path.startswith("assets/"):
        return "asset"
    return "site-source"


def front_matter(data):
    source = data.decode("utf-8", errors="replace")
    if not source.startswith("---\n"):
        return ""
    parts = source.split("---\n", 2)
    return parts[1] if len(parts) == 3 else ""


def route_for(path, metadata):
    permalink = re.search(r"^permalink:\s*['\"]?([^\s'\"]+)", metadata, re.M)
    if permalink:
        return "/weblog" + permalink.group(1)
    if path.startswith("_posts/"):
        name = Path(path).stem
        date, slug = name[:10], name[11:]
        published = re.search(r"^date:\s*(.+)$", metadata, re.M)
        if published:
            # Jekyll builds in UTC here; preserve the instant, not filename date.
            instant = datetime.strptime(published.group(1).strip(), "%Y-%m-%d %H:%M:%S %z")
            date = instant.astimezone(timezone.utc).strftime("%Y-%m-%d")
        return f"/weblog/{date.replace('-', '/')}/{slug}.html"
    if path == "index.html":
        return "/weblog/"
    if path == "404.html":
        return "/weblog/404.html"
    if path.startswith("assets/"):
        return "/weblog/" + path
    return None


def build():
    files = []
    routes = []
    paths = git("ls-tree", "-r", "--name-only", BASE).decode().splitlines()
    for path in paths:
        data = git("show", f"{BASE}:{path}")
        metadata = front_matter(data)
        entry = {
            "path": path,
            "kind": kind(path),
            "sha256": hashlib.sha256(data).hexdigest(),
            "bytes": len(data),
        }
        if metadata:
            entry["front_matter"] = metadata
        if entry["kind"] in {"post", "page", "tag", "series"}:
            entry["external_assets"] = sorted(set(URL.findall(data.decode("utf-8", errors="replace"))))
        files.append(entry)
        route = route_for(path, metadata)
        if route:
            routes.append({"route": route, "source": path})
    return {"baseline_commit": BASE, "files": files}, {"baseline_commit": BASE, "routes": sorted(routes, key=lambda r: r["route"])}


def main():
    content, routes = build()
    output = ROOT / "docs" / "inventory"
    output.mkdir(parents=True, exist_ok=True)
    for name, value in (("legacy-content.json", content), ("legacy-routes.json", routes)):
        (output / name).write_text(json.dumps(value, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()
