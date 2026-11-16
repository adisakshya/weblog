#!/usr/bin/env python3
"""Compare output against independently frozen original Jekyll semantics."""
import json
from pathlib import Path
import sys
sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'scripts'))
from rendered_preservation import ROOT, verify

if __name__ == '__main__':
    if len(sys.argv) != 2:
        raise SystemExit('Usage: python tests/test_rendered_content.py STATIC_PUBLIC_ROOT')
    baseline = json.loads((ROOT / 'docs/inventory/legacy-rendered.json').read_text())
    verify(sys.argv[1], baseline)
    print(f"PASS: {len(baseline['routes'])} routes; original prose, code, images, anchors, dates and assets preserved.")
