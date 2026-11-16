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

    def test_code_whitespace_changed(self):
        # Preserve normalized prose while changing only exact code whitespace.
        original = self.entry['code'][0]
        with tempfile.TemporaryDirectory() as tmp:
            path = locate(tmp, self.entry['route'])
            path.parent.mkdir(parents=True)
            path.write_text(self.html)
            bad = copy.deepcopy(self.entry)
            bad['code'][0] = original + ' '
            with self.assertRaisesRegex(AssertionError, 'code whitespace'):
                verify(tmp, {'routes':[bad]})

if __name__ == '__main__':
    unittest.main()
