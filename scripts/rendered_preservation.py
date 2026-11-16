"""Semantic preservation checks independent of React/Jekyll markup composition.

Capture only from a verified original Jekyll build, never from the redesign.
"""
from collections import Counter
from html.parser import HTMLParser
import hashlib
import json
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]


def normalize(text):
    return re.sub(r'\s+', ' ', text).strip()


class Page(HTMLParser):
    def __init__(self, html):
        super().__init__(convert_charrefs=True)
        self.stack = []
        self.active = []
        self.blocks, self.codes, self.images, self.anchors, self.times = [], [], [], [], []
        self.content = []
        self.in_body = 0
        self.feed(html)

    def handle_starttag(self, tag, attributes):
        attrs = dict(attributes)
        if tag in {'area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr'}:
            if tag == 'img' and self.in_body:
                self.images.append(attrs.get('src', ''))
            return
        if 'page__content' in attrs.get('class', '').split() or tag == 'main' or attrs.get('role') == 'main':
            self.in_body += 1
            boundary = True
        else:
            boundary = False
        self.stack.append((tag, boundary))
        if self.in_body:
            if attrs.get('id'):
                self.anchors.append(attrs['id'])
            if tag in {'p','li','h1','h2','h3','h4','h5','h6','pre','td','th'}:
                self.active.append([tag, len(self.stack), []])
        if tag == 'time' and attrs.get('datetime'):
            self.times.append(attrs['datetime'])

    def handle_endtag(self, tag):
        if not any(t == tag for t, _ in self.stack):
            return
        while self.stack:
            current, boundary = self.stack.pop()
            for block in self.active[:]:
                if block[1] > len(self.stack):
                    text = ''.join(block[2])
                    if normalize(text):
                        self.blocks.append(normalize(text))
                        if block[0] == 'pre':
                            self.codes.append(text)
                    self.active.remove(block)
            if boundary:
                self.in_body -= 1
            if current == tag:
                break

    def handle_data(self, data):
        if self.in_body:
            self.content.append(data)
            for block in self.active:
                block[2].append(data)


def locate(output, route):
    relative = route.removeprefix('/weblog/')
    if not relative or relative.endswith('/'):
        relative += 'index.html'
    # Caller supplies the actual public root; never allow a mixed-root build to pass.
    return Path(output) / relative


def capture(output):
    entries = json.loads((ROOT / 'docs/inventory/legacy-routes.json').read_text())['routes']
    result = []
    for entry in entries:
        file = locate(output, entry['route'])
        assert file.is_file(), f"Missing route: {entry['route']}"
        record = dict(entry)
        if entry['source'].startswith(('_posts/', '_pages/')):
            page = Page(file.read_text())
            assert page.blocks, f"No body content: {entry['route']}"
            record.update(blocks=page.blocks, code=page.codes, images=page.images,
                          anchors=page.anchors, times=page.times,
                          contribution_count=normalize(''.join(page.content)).count('Contribution'))
        elif entry['source'].startswith('assets/'):
            record['sha256'] = hashlib.sha256(file.read_bytes()).hexdigest()
        result.append(record)
    return result


def verify(output, baseline):
    for entry in baseline['routes']:
        path = locate(output, entry['route'])
        assert path.is_file(), f"Missing route: {entry['route']}"
        if 'sha256' in entry:
            assert hashlib.sha256(path.read_bytes()).hexdigest() == entry['sha256'], f"Changed asset: {entry['route']}"
        if 'blocks' not in entry:
            continue
        page = Page(path.read_text())
        text = normalize(''.join(page.content))
        for block in entry['blocks']:
            assert block in text, f"Lost content at {entry['route']}: {block[:100]}"
        for code in entry['code']:
            assert code in page.codes, f"Changed code whitespace at {entry['route']}"
        for field in ('images', 'anchors', 'times'):
            actual = Counter(getattr(page, field))
            for value, count in Counter(entry[field]).items():
                assert actual[value] >= count, f"Lost {field} {value} at {entry['route']}"
        assert text.count('Contribution') == entry['contribution_count'], f"Duplicated Contribution at {entry['route']}"
