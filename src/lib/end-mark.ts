// The article end-mark (brand spec: docs/brand/README.md, #86): one small vermilion point after the last word of a post, like a
// magazine's end sign. It is added at RENDER time to the already-sanitised article HTML, so the authored Markdown is never edited,
// nothing is injected into a code block, and the server-rendered HTML and the hydrated page carry exactly the same markup.
//
// Placement, for the last top-level block of the post:
//  - a paragraph, heading, blockquote ending in a paragraph, list or table with text: right after its last line of text, inside
//    the block, so the point follows the last word;
//  - anything else (a code block, an image, a video, an empty block): on its own left-aligned line after the block.

const VOID = new Set([
  "area",
  "base",
  "br",
  "col",
  "embed",
  "hr",
  "img",
  "input",
  "link",
  "meta",
  "source",
  "track",
  "wbr",
]);
const TEXT_BLOCKS = new Set(["p", "h1", "h2", "h3", "h4", "h5", "h6"]);

export const END_MARK = `<span class="end-mark" role="img" aria-label="End of article"></span>`;
const OWN_LINE = `<p class="end-mark-line">${END_MARK}</p>`;

type Block = { tag: string; start: number; end: number; open: string };

/** The top-level elements of well-formed HTML (the sanitiser's output), by position. */
function topLevelBlocks(html: string): Block[] {
  const blocks: Block[] = [];
  const re = /<(\/?)([a-zA-Z][a-zA-Z0-9]*)\b[^>]*?(\/?)>/g;
  let depth = 0;
  let current: Block | null = null;
  for (let m = re.exec(html); m; m = re.exec(html)) {
    const closing = m[1] === "/";
    const tag = m[2]!.toLowerCase();
    const selfClosed = m[3] === "/" || VOID.has(tag);
    if (closing) {
      // the authored HTML closes some void elements explicitly (<source ...></source>): that closing tag opens nothing
      if (VOID.has(tag)) continue;
      depth--;
      if (depth === 0 && current) {
        current.end = m.index + m[0].length;
        blocks.push(current);
        current = null;
      }
    } else if (selfClosed) {
      if (depth === 0) blocks.push({ tag, start: m.index, end: m.index + m[0].length, open: m[0] });
    } else {
      if (depth === 0) current = { tag, start: m.index, end: -1, open: m[0] };
      depth++;
    }
  }
  return blocks;
}

const visibleText = (fragment: string) =>
  fragment
    .replace(/<span class="sr-only">[\s\S]*?<\/span>/g, "")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;|\s+/g, "");

/** Index at which to insert the point inside `block` (just before the closing tag that ends its last line of text), or -1. */
function insideEnd(html: string, block: Block): number {
  const source = html.slice(block.start, block.end);
  if (/\bcode-block\b/.test(block.open)) return -1;
  if (/<pre[\s>]/.test(source)) return -1; // never inside a code block
  if (!visibleText(source)) return -1;
  const abs = (i: number) => block.start + i;
  if (TEXT_BLOCKS.has(block.tag)) return abs(source.lastIndexOf("</"));
  if (block.tag === "blockquote") {
    const p = source.lastIndexOf("</p>");
    // only when the quote really ends in a paragraph (nothing but whitespace between that </p> and </blockquote>)
    return p >= 0 && !visibleText(source.slice(p + 4)) && !/<[a-z]/i.test(source.slice(p + 4))
      ? abs(p)
      : -1;
  }
  if (block.tag === "ul" || block.tag === "ol") {
    const li = source.lastIndexOf("</li>");
    if (li < 0) return -1;
    const before = source.slice(0, li).trimEnd();
    // the last item must end in text, not in a nested list
    return /<\/(ul|ol)>$/.test(before) ? -1 : abs(li);
  }
  if (/table-wrap/.test(block.open)) {
    const td = source.lastIndexOf("</td>");
    return td >= 0 ? abs(td) : -1;
  }
  return -1;
}

/** `html` with the end-mark added after the last word of the last block (or on its own line when that block has no text). */
export function appendEndMark(html: string): string {
  const blocks = topLevelBlocks(html);
  const last = blocks[blocks.length - 1];
  if (!last) return html + OWN_LINE;
  const at = insideEnd(html, last);
  if (at >= 0) return html.slice(0, at) + END_MARK + html.slice(at);
  return html.slice(0, last.end) + OWN_LINE + html.slice(last.end);
}
