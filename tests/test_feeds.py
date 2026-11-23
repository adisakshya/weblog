#!/usr/bin/env python3
"""sitemap.xml and feed.xml must be well-formed, complete and consistent with the built site.   Requires: bun run build"""
import re
import unittest
import xml.etree.ElementTree as ET
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DIST = ROOT / "dist/client"
SITE = "https://adisakshya.github.io"
SM = "{http://www.sitemaps.org/schemas/sitemap/0.9}"
AT = "{http://www.w3.org/2005/Atom}"


def front(path):
    text = path.read_text(encoding="utf8").split("---")[1]
    return {k: v.strip().strip('"') for k, v in re.findall(r"^(\w+):\s*(.+)$", text, re.M)}


def file_for(url):
    rel = url.removeprefix(SITE + "/weblog/")
    return DIST / (rel + "index.html" if rel == "" or rel.endswith("/") else rel)


class Feeds(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.sitemap = ET.parse(DIST / "sitemap.xml").getroot()
        cls.feed = ET.parse(DIST / "feed.xml").getroot()
        cls.urls = [u.find(SM + "loc").text for u in cls.sitemap.findall(SM + "url")]

    def test_every_sitemap_url_is_an_absolute_built_page(self):
        self.assertGreaterEqual(len(self.urls), 18)
        self.assertEqual(len(self.urls), len(set(self.urls)))
        for url in self.urls:
            self.assertTrue(url.startswith(SITE + "/weblog/"), url)
            self.assertTrue(file_for(url).is_file(), f"sitemap lists a page that was not built: {url}")

    def test_sitemap_covers_every_content_route(self):
        expected = {SITE + "/weblog/"}
        for p in (ROOT / "_posts").glob("*.md"):
            self.assertTrue(any(u.endswith(p.stem[11:] + ".html") for u in self.urls), p.name)
        for kind in ("tags", "series"):
            for p in (ROOT / "_pages" / kind).glob("*.md"):
                expected.add(f"{SITE}/weblog/{kind}/{p.stem}/")
        for p in (ROOT / "_pages").glob("*.md"):
            expected.add(f"{SITE}/weblog/{p.stem}/")
        self.assertTrue(expected <= set(self.urls), sorted(expected - set(self.urls)))

    def test_feed_is_valid_atom_with_every_post(self):
        self.assertEqual(self.feed.tag, AT + "feed")
        for child in ("title", "id", "updated", "author"):
            self.assertIsNotNone(self.feed.find(AT + child), child)
        entries = self.feed.findall(AT + "entry")
        posts = {front(p)["title"] for p in (ROOT / "_posts").glob("*.md")}
        self.assertEqual({e.find(AT + "title").text for e in entries}, posts)
        for e in entries:
            link = e.find(AT + "link").get("href")
            self.assertTrue(link.startswith(SITE + "/weblog/") and link.endswith(".html"), link)
            self.assertTrue(file_for(link).is_file(), link)
            self.assertEqual(e.find(AT + "id").text, link)
            self.assertRegex(e.find(AT + "published").text, r"^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d")
            body = e.find(AT + "content").text
            self.assertIn("<p>", body)
            # Liquid must be resolved. Only Liquid variables/tags count: a post may legitimately show GitHub Actions
            # expressions such as ${{ github.repository }} in a code block.
            self.assertNotRegex(body, r"\{\{\s*(site|page|paginator|content|include)\b|\{%")
            self.assertNotRegex(body, r"(?i)<script|onerror=|javascript:")

    def test_feed_has_published_dates_matching_permalinks(self):
        by_link = {e.find(AT + "link").get("href"): e.find(AT + "published").text[:10] for e in self.feed.findall(AT + "entry")}
        for link, date in by_link.items():
            y, m, d = re.search(r"/weblog/(\d{4})/(\d\d)/(\d\d)/", link).groups()
            self.assertEqual(date, f"{y}-{m}-{d}", link)

    def test_pages_advertise_the_feed(self):
        for page in ("index.html", "contact/index.html", "2022/02/01/introduction-to-api-gateway.html"):
            html = (DIST / page).read_text(encoding="utf8")
            self.assertRegex(html, r'rel="alternate"[^>]*href="/weblog/feed\.xml"|href="/weblog/feed\.xml"[^>]*rel="alternate"', page)


if __name__ == "__main__":
    unittest.main()
