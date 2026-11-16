"""Prove the semantic gate detects content loss, independent of source hashes."""
import copy
import json
from pathlib import Path
import sys
import tempfile
import unittest
sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'scripts'))
from rendered_preservation import ROOT, locate, verify


class PreservationRegressionTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.entry = next(e for e in json.loads((ROOT/'docs/inventory/legacy-rendered.json').read_text())['routes']
                         if '/2022/07/16/' in e['route'])
        cls.html = locate(ROOT/'_site', cls.entry['route']).read_text()

    def check_mutation(self, old, new):
        self.assertIn(old, self.html)
        changed = self.html.replace(old, new)
        with tempfile.TemporaryDirectory() as tmp:
            path = locate(tmp, self.entry['route'])
            path.parent.mkdir(parents=True)
            path.write_text(changed)
            with self.assertRaises(AssertionError):
                verify(tmp, {'routes':[copy.deepcopy(self.entry)]})

    def test_missing_prose(self):
        self.check_mutation('Prerequisites', 'REMOVED')

    def test_changed_publication_instant(self):
        self.check_mutation('2022-07-16T19:00:00+00:00', '2022-07-17T00:30:00+00:00')

    def test_lost_anchor(self):
        self.check_mutation('id="prerequisites"', 'id="wrong"')

    def test_missing_image(self):
        self.check_mutation(self.entry['images'][0], '/missing.png')

    def test_link_destination_changed(self):
        self.check_mutation('href="/weblog/series/api-gateway-101/"',
                            'href="/weblog/broken-destination/"')

    def test_code_whitespace_changed(self):
        # Change only rendered code whitespace; the expected fixture stays fixed.
        import re
        match = re.search(r'(<pre[^>]*>.*?)(\n)(.*?</pre>)', self.html, re.S)
        self.assertIsNotNone(match)
        self.check_mutation(match.group(0), match.group(1) + ' \n' + match.group(3))

    def test_empty_home_and_error(self):
        entries = json.loads((ROOT/'docs/inventory/legacy-rendered.json').read_text())['routes']
        for entry in entries:
            if entry['source'] not in {'index.html', '404.html'}:
                continue
            with self.subTest(route=entry['route']), tempfile.TemporaryDirectory() as tmp:
                path = locate(tmp, entry['route'])
                path.parent.mkdir(parents=True, exist_ok=True)
                path.write_text('')
                with self.assertRaises(AssertionError):
                    verify(tmp, {'routes':[entry]})

    def test_infrastructure_leak(self):
        with tempfile.TemporaryDirectory() as tmp:
            (Path(tmp)/'docs').mkdir()
            with self.assertRaisesRegex(AssertionError, 'infrastructure'):
                verify(tmp, {'routes':[]})

if __name__ == '__main__':
    unittest.main()
