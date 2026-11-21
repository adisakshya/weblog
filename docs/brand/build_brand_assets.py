"""Build Adi brand assets: outlined SVGs (no web fonts needed) + PNG/ICO exports.

Usage:  python3 docs/brand/build_brand_assets.py <fonts_dir> <out_dir>
Needs:  pip install uharfbuzz fonttools cairosvg pillow
Fonts (OFL, from github.com/google/fonts, not committed):
  <fonts_dir>/tiro.ttf        = ofl/tirodevanagarihindi/TiroDevanagariHindi-Regular.ttf
                                sha256 d2abcb4d352f0bfab91632df5d9c8173882073c182e662fa731a5a738e6681d7
  <fonts_dir>/newsreader.ttf  = ofl/newsreader/Newsreader[opsz,wght].ttf
                                sha256 8a08d13f8a6c0d51be379a60af84f945f65369a67e509ee3c3bdcc421254d7c1
HarfBuzz shaping is required: Devanagari reorders the ि vowel sign before द; naive glyph-by-glyph drawing renders it wrong.
"""
import io, os, sys
import uharfbuzz as hb
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.boundsPen import BoundsPen
from fontTools.varLib.instancer import instantiateVariableFont
import cairosvg
from PIL import Image

FONTS, OUT = sys.argv[1], sys.argv[2]
os.makedirs(OUT, exist_ok=True)
INK, PAPER, VERMILION = "#1A1A1A", "#F7F5F0", "#E2452F"

def load(path, variations=None):
    tt = TTFont(path)
    if variations:
        tt = instantiateVariableFont(tt, variations)
    buf = io.BytesIO(); tt.save(buf); data = buf.getvalue()
    tt = TTFont(io.BytesIO(data))
    return tt, hb.Font(hb.Face(data))

TIRO = load(f"{FONTS}/tiro.ttf")
NEWS = load(f"{FONTS}/newsreader.ttf", {"wght": 500, "opsz": 72})

def shape(font, text, tracking=0):
    """Return (path_d in font units y-up, advance, (xmin,ymin,xmax,ymax))."""
    tt, hbf = font
    buf = hb.Buffer(); buf.add_str(text); buf.guess_segment_properties()
    hb.shape(hbf, buf, {"kern": True, "liga": True})
    gs = tt.getGlyphSet(); order = tt.getGlyphOrder()
    pen = SVGPathPen(gs); bp = BoundsPen(gs)
    x = 0; parts = []
    for info, pos in zip(buf.glyph_infos, buf.glyph_positions):
        name = order[info.codepoint]
        ox, oy = x + pos.x_offset, pos.y_offset
        p = SVGPathPen(gs); gs[name].draw(p)
        d = p.getCommands()
        if d:
            parts.append(f'<path transform="translate({ox} {oy})" d="{d}"/>')
        from fontTools.pens.transformPen import TransformPen
        gs[name].draw(TransformPen(bp, (1, 0, 0, 1, ox, oy)))
        x += pos.x_advance + tracking
    return "".join(parts), x - tracking, bp.bounds

def mark_group(font, text, size, point_em, gap_em, color, point_color, tracking=0):
    """Text + point as an SVG group in px, y-down, origin at (0, baseline). Returns (svg, bbox px)."""
    upm = font[0]["head"].unitsPerEm
    s = size / upm
    paths, adv, (x0, y0, x1, y1) = shape(font, text, tracking)
    r = point_em * size / 2
    cx = adv * s + gap_em * size + r
    cy = -r  # sits on baseline
    svg = (f'<g fill="{color}" transform="scale({s} {-s})">{paths}</g>'
           f'<circle cx="{cx:.2f}" cy="{cy:.2f}" r="{r:.2f}" fill="{point_color}"/>')
    bbox = (min(x0 * s, 0), min(-y1 * s, cy - r), cx + r, max(-y0 * s, 0))
    return svg, bbox

def centered(svg_bbox, box_w, box_h, ox=0, oy=0):
    svg, (bx0, by0, bx1, by1) = svg_bbox
    tx = ox + (box_w - (bx1 - bx0)) / 2 - bx0
    ty = oy + (box_h - (by1 - by0)) / 2 - by0
    return f'<g transform="translate({tx:.2f} {ty:.2f})">{svg}</g>'

def write(name, svg):
    with open(f"{OUT}/{name}", "w") as f: f.write(svg)

def svg_doc(w, h, body, title):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" width="{w}" height="{h}" '
            f'role="img" aria-label="{title}"><title>{title}</title>{body}</svg>')

# 1) Seal (tile + आदि + point), light and dark, 100x100 viewBox
for theme, tile, ink in (("light", INK, PAPER), ("dark", PAPER, INK)):
    g = mark_group(TIRO, "आदि", 34, 0.16, 0.05, ink, VERMILION)
    body = f'<rect width="100" height="100" rx="17" fill="{tile}"/>' + centered(g, 100, 100)
    write(f"adi-seal-{theme}.svg", svg_doc(100, 100, body, "Adi"))

# 1b) Themeable seal for INLINE use in the site: colours come from CSS custom properties
#     (--adi-tile, --adi-glyph, --adi-point) with the light-theme values as fallbacks.
g = mark_group(TIRO, "आदि", 34, 0.16, 0.05, "var(--adi-glyph, %s)" % PAPER, "var(--adi-point, %s)" % VERMILION)
body = f'<rect width="100" height="100" rx="17" fill="var(--adi-tile, {INK})"/>' + centered(g, 100, 100)
write("adi-seal-themeable.svg", svg_doc(100, 100, body, "Adi"))

# 2) Bare mark, text uses currentColor (for 404 / inline use)
g = mark_group(TIRO, "आदि", 100, 0.14, 0.05, "currentColor", VERMILION)
bx0, by0, bx1, by1 = g[1]; W, H = bx1 - bx0 + 8, by1 - by0 + 8
write("adi-mark.svg", svg_doc(round(W), round(H), centered(g, W, H), "Adi"))

# 3) Favicon: आ + point on ink tile
g = mark_group(TIRO, "आ", 40, 0.2, 0.04, PAPER, VERMILION)
fav = svg_doc(64, 64, '<rect width="64" height="64" rx="11" fill="%s"/>' % INK + centered(g, 64, 64), "Adi")
write("favicon.svg", fav)
for px in (16, 32, 48, 180, 192, 512):
    cairosvg.svg2png(bytestring=fav.encode(), write_to=f"{OUT}/favicon-{px}.png", output_width=px, output_height=px)
Image.open(f"{OUT}/favicon-48.png").save(f"{OUT}/favicon.ico", sizes=[(16, 16), (32, 32), (48, 48)])
os.replace(f"{OUT}/favicon-180.png", f"{OUT}/apple-touch-icon.png")

# 4) Social share image 1200x630: seal + "adisakshya" wordmark + point, no tagline
seal = mark_group(TIRO, "आदि", 76, 0.16, 0.05, PAPER, VERMILION)
word = mark_group(NEWS, "adisakshya", 124, 0.13, 0.04, INK, VERMILION, tracking=-30)
wb = word[1]; ww, wh = wb[2] - wb[0], wb[3] - wb[1]
tile, gap = 208, 52
total = tile + gap + ww
x0 = (1200 - total) / 2
body = (f'<rect width="1200" height="630" fill="{PAPER}"/>'
        f'<rect x="{x0:.2f}" y="{(630 - tile) / 2:.2f}" width="{tile}" height="{tile}" rx="34" fill="{INK}"/>'
        + centered(seal, tile, tile, x0, (630 - tile) / 2)
        + centered(word, ww, wh, x0 + tile + gap, (630 - wh) / 2))
og = svg_doc(1200, 630, body, "Adisakshya Chauhan")
write("og-image.svg", og)
cairosvg.svg2png(bytestring=og.encode(), write_to=f"{OUT}/og-image.png", output_width=1200, output_height=630)
print("built:", sorted(os.listdir(OUT)))
