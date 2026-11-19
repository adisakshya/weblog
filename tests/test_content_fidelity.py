#!/usr/bin/env python3
"""The content-fidelity gate must pass on the real build and FAIL when authored content is lost or altered.

Requires a built site: bun run build
"""
import shutil
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DIST = ROOT / "dist/client"
SETUP = "2022/07/16/setting-up-an-api-ateway-for-your-microservices.html"


def run(dist):
    return subprocess.run([sys.executable, str(ROOT / "scripts/check_content_fidelity.py"), str(dist)], capture_output=True, text=True)


class FidelityGate(unittest.TestCase):
    def mutated(self, relative, old, new, count=1):
        tmp = Path(tempfile.mkdtemp())
        self.addCleanup(shutil.rmtree, tmp, True)
        dist = tmp / "dist"
        shutil.copytree(DIST, dist)
        path = dist / relative
        html = path.read_text(encoding="utf8")
        self.assertIn(old, html, f"fixture text not found: {old!r}")
        path.write_text(html.replace(old, new, count), encoding="utf8")
        return run(dist)

    def test_real_build_passes(self):
        result = run(DIST)
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)

    def test_changed_prose_fails(self):
        r = self.mutated(SETUP, "Postman collections are basically a group of saved API requests", "Postman collections are a group of saved API requests")
        self.assertNotEqual(r.returncode, 0)
        self.assertIn("lost block", r.stdout)

    def test_straight_quotes_fail(self):
        # kramdown rendered typographic apostrophes; regressing to straight quotes must be caught
        r = self.mutated(SETUP, "We’ll be spinning up", "We'll be spinning up")
        self.assertNotEqual(r.returncode, 0)

    def test_lost_authored_link_fails(self):
        r = self.mutated(SETUP, 'href="https://docs.docker.com/get-started/"', 'href="https://example.com/"')
        self.assertNotEqual(r.returncode, 0)
        self.assertIn("lost link", r.stdout)

    def test_broken_liquid_baseurl_link_fails(self):
        r = self.mutated(SETUP, 'href="/weblog/series/api-gateway-101/"', 'href="{{site.baseurl}}/series/api-gateway-101/"')
        self.assertNotEqual(r.returncode, 0)

    def test_code_whitespace_change_fails(self):
        r = self.mutated(SETUP, "docker ps -a\n</code>", "docker ps -a</code>")
        self.assertNotEqual(r.returncode, 0)
        self.assertIn("code block changed", r.stdout)

    def test_lost_heading_anchor_fails(self):
        r = self.mutated(SETUP, 'id="prerequisites"', 'id="wrong"')
        self.assertNotEqual(r.returncode, 0)
        self.assertIn("lost anchor #prerequisites", r.stdout)

    def test_duplicated_contribution_heading_fails(self):
        r = self.mutated(SETUP, "</article>", "<h2>Contribution</h2></article>")
        self.assertNotEqual(r.returncode, 0)
        self.assertIn("Contribution", r.stdout)

    def test_unlinked_tag_fails(self):
        r = self.mutated("index.html", 'href="/weblog/tags/travis"', 'href="/weblog/tags/other"', count=5)
        self.assertNotEqual(r.returncode, 0)

    def test_lost_image_fails(self):
        html = (DIST / SETUP).read_text(encoding="utf8")
        import re
        src = re.search(r'<img src="(https://[^"]+)"[^>]*class="zoomable"', html).group(1)  # an inline article image
        r = self.mutated(SETUP, src, "https://example.com/missing.png")
        self.assertNotEqual(r.returncode, 0)
        self.assertIn("lost image", r.stdout)


if __name__ == "__main__":
    unittest.main()
