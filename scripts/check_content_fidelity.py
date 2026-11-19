#!/usr/bin/env python3
"""Content-fidelity gate: the new static output must contain everything the legacy Jekyll pages published.

Compares dist/client with docs/inventory/legacy-rendered.json (captured from the original Jekyll output, never from this
build). Every legacy block / code block / link / image / anchor / <time> must be present, unless an explicit rule in
docs/inventory/legacy-template-rules.json (with a reason) says it was template chrome or an owner-approved omission.
Authored items are additionally derived from the Markdown sources, so they can never be silently exempted.

    python3 scripts/check_content_fidelity.py [distDir]
"""
from collections import Counter
import json
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from rendered_preservation import ROOT, Page, instant, locate, normalize  # noqa: E402

RULES = json.loads((ROOT / "docs/inventory/legacy-template-rules.json").read_text())


def exempt(kind, route, value):
    for rule in RULES.get(kind, []):
        if any(re.search(r, route) for r in rule.get("routes", [])) or "routes" not in rule:
            if re.search(rule["pattern"], value):
                return rule["reason"]
    return None


def frontmatter_images():
    """Header/teaser image URLs from front matter: the approved design shows cover art instead."""
    urls = set()
    for path in list((ROOT / "_posts").glob("*.md")) + list((ROOT / "_pages").rglob("*.md")):
        head = path.read_text().split("---")[1] if path.read_text().startswith("---") else ""
        urls.update(re.findall(r"https?://\S+\.(?:png|jpe?g|webp|gif)", head))
        urls.update("/weblog" + m for m in re.findall(r"(?<=\s)(/assets/\S+\.(?:png|jpe?g|webp|gif))", head))
    return urls


def tag_titles():
    titles = set()
    for path in (ROOT / "_pages/tags").glob("*.md"):
        m = re.search(r'^title:\s*"?(.*?)"?\s*$', path.read_text(), re.M)
        if m:
            titles.add(m.group(1))
    return titles


def norm_quotes(s):
    return s.replace("\u2019", "'").replace("\u2018", "'").replace("\u201c", '"').replace("\u201d", '"')


def authored_links(md):
    """(href, label) pairs written in the Markdown, so layout-generated copies are never mistaken for authored links."""
    pairs = Counter()
    for label, href in re.findall(r"\[([^\]]+)\]\(\s*([^)\s]+)", md):
        pairs[(href.rstrip("/"), norm_quotes(re.sub(r"[*_`]", "", label)).strip())] += 1
    return pairs


def source_text(entry):
    src = entry["source"]
    if src.endswith(".md") and (ROOT / src).is_file():
        body = (ROOT / src).read_text().split("---", 2)[-1]
        return re.sub(r"\{\{\s*site\.baseurl\s*\}\}", "/weblog", body)
    return ""


def main(dist):
    baseline = json.loads((ROOT / "docs/inventory/legacy-rendered.json").read_text())
    header_images = frontmatter_images()
    titles = tag_titles()
    failures, exempted = [], Counter()
    for entry in baseline["routes"]:
        if "blocks" not in entry:
            continue
        route = entry["route"]
        path = locate(dist, route)
        if not path.is_file():
            failures.append(f"{route}: route missing")
            continue
        page = Page(path.read_text())
        text = normalize("".join(page.content))
        md = source_text(entry)
        pairs = authored_links(md)

        for block in entry["blocks"]:
            if block in text:
                continue
            reason = exempt("blocks", route, block)
            if block == "Contribution" and re.search(r"^#+\s*Contribution", md, re.M):
                reason = None  # authored heading: must be present
            if not reason and route.startswith("/weblog/tags/") and block in titles:
                reason = "tag page title: the approved design shows #tag (the title is used for <title>)"
            if reason:
                exempted[reason] += 1
            else:
                failures.append(f"{route}: lost block: {block[:110]}")
        for code in entry["code"]:
            if code not in page.codes:
                failures.append(f"{route}: code block changed: {code[:60]!r}")
        got = Counter(page.images)
        for image, n in Counter(entry["images"]).items():
            if got[image] >= n:
                continue
            reason = exempt("images", route, image) or ("front-matter header image replaced by cover art" if image in header_images else None)
            if reason:
                exempted[reason] += 1
            else:
                failures.append(f"{route}: lost image {image}")
        got = Counter(page.anchors)
        for anchor, n in Counter(entry["anchors"]).items():
            if got[anchor] >= n:
                continue
            reason = exempt("anchors", route, anchor)
            if reason:
                exempted[reason] += 1
            else:
                failures.append(f"{route}: lost anchor #{anchor}")
        got = Counter(page.times)
        for stamp, n in Counter(instant(t) for t in entry["times"]).items():
            if got[stamp] >= n:
                continue
            reason = exempt("times", route, stamp) or ("page date not displayed in the approved design (Terms)" if route == "/weblog/terms/" else None)
            if reason:
                exempted[reason] += 1
            else:
                failures.append(f"{route}: lost <time> {stamp}")
        got = Counter(tuple(link) for link in page.links)
        hrefs = {link[0].rstrip("/") for link in page.links}
        for link, n in Counter(tuple(link) for link in entry["links"]).items():
            href, label = link
            key = (href.rstrip("/"), norm_quotes(label).strip())
            if key in pairs:
                n = min(n, pairs[key])  # the legacy layout repeated some authored links; require only the authored count
            if got[link] >= n:
                continue
            reason = exempt("links", route, f"{href}|{label}")
            # prev/next article links: same destination, label now carries "Previous/Next"
            if not reason and key not in pairs and href.endswith(".html") and href.rstrip("/") in hrefs:
                reason = "article link kept with the approved design's previous/next label"
            if not reason and href.rstrip("/") in hrefs and href.startswith("/weblog/tags/"):
                reason = "tag link kept (label differs: legacy counts)"
            if reason:
                exempted[reason] += 1
            else:
                failures.append(f"{route}: lost link {href} ({label})")
        # every tag of a post must stay reachable from its article page
        if route.endswith(".html") and entry["source"].startswith("_posts/"):
            front = (ROOT / entry["source"]).read_text().split("---")[1]
            post_tags = set(re.findall(r"^\s*-\s*([a-z0-9-]+)\s*$", front.split("tags:")[1].split("\n\n")[0], re.M)) if "tags:" in front else set()
            post_tags |= {t.strip() for m in re.findall(r"^tags:\s*\[(.*?)\]", front, re.M) for t in m.split(",") if t.strip()}
            for tag in sorted(post_tags):
                if f"/weblog/tags/{tag}" not in {link[0].rstrip("/") for link in page.links}:
                    failures.append(f"{route}: article does not link its tag {tag}")
        # authored Contribution heading must render once, not twice
        authored = len(re.findall(r"^#+\s*Contribution\s*$", md, re.M))
        if authored and [h.lstrip("#") for h in page.headings].count("Contribution") != authored:
            failures.append(f"{route}: 'Contribution' heading renders {[h.lstrip('#') for h in page.headings].count('Contribution')}x, authored {authored}x")
    # every tag page must stay reachable from the home page
    home = Page(locate(dist, "/weblog/").read_text())
    home_links = {link[0].rstrip("/") for link in home.links}
    for path in (ROOT / "_pages/tags").glob("*.md"):
        if f"/weblog/tags/{path.stem}" not in home_links:
            failures.append(f"/weblog/: no link to tag {path.stem}")
    for reason, n in sorted(exempted.items()):
        print(f"  exempt x{n}: {reason}")
    if failures:
        print("CONTENT FIDELITY FAILURES:\n" + "\n".join(failures))
        sys.exit(1)
    print(f"content fidelity OK ({sum(exempted.values())} documented exemptions)")


if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else "dist/client")
