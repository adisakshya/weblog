import { describe, expect, it } from "vitest";
import { END_MARK, appendEndMark } from "./end-mark";

const count = (s: string) => s.split('aria-label="End of article"').length - 1;
const strip = (s: string) =>
  s.split(END_MARK).join("").replace('<p class="end-mark-line"></p>', "");

describe("appendEndMark", () => {
  it("puts the point after the last word of a final paragraph, inside it", () => {
    const html = "<p>One.</p>\n<p>See you there!</p>";
    expect(appendEndMark(html)).toBe(`<p>One.</p>\n<p>See you there!${END_MARK}</p>`);
  });
  it("goes after a trailing link, still inside the paragraph, and not inside the link", () => {
    const html = `<p>Report it <a href="https://x.y" rel="noopener noreferrer" target="_blank">here<span class="sr-only"> (opens in a new tab)</span></a>.</p>`;
    const out = appendEndMark(html);
    expect(out.endsWith(`.${END_MARK}</p>`)).toBe(true);
    expect(count(out)).toBe(1);
  });
  it("follows the last line of a final list item, a heading, a blockquote paragraph and a table cell", () => {
    expect(appendEndMark("<ul>\n<li>a</li>\n<li>b</li>\n</ul>")).toBe(
      `<ul>\n<li>a</li>\n<li>b${END_MARK}</li>\n</ul>`,
    );
    expect(appendEndMark("<h2>#End</h2>")).toBe(`<h2>#End${END_MARK}</h2>`);
    expect(appendEndMark("<blockquote>\n<p>quoted</p>\n</blockquote>")).toBe(
      `<blockquote>\n<p>quoted${END_MARK}</p>\n</blockquote>`,
    );
    const table = `<div class="table-wrap" tabindex="0"><table><tbody><tr><td>a</td><td>z</td></tr></tbody></table></div>`;
    expect(appendEndMark(table)).toContain(`<td>z${END_MARK}</td>`);
  });
  it("never injects into a code block: it goes on its own line after it", () => {
    const code = `<div class="code-block" data-lang="bash"><pre tabindex="0"><code class="hljs">npm i\n</code></pre><button class="copy-btn">Copy</button></div>`;
    const out = appendEndMark(`<p>Run:</p>${code}`);
    expect(out).toBe(`<p>Run:</p>${code}<p class="end-mark-line">${END_MARK}</p>`);
    expect(out.slice(out.indexOf("<pre"), out.indexOf("</pre>"))).not.toContain("end-mark");
    // also a bare <pre>
    expect(appendEndMark("<pre><code>x</code></pre>")).toBe(
      `<pre><code>x</code></pre><p class="end-mark-line">${END_MARK}</p>`,
    );
  });
  it("goes on its own line after an image, a video, a rule or a paragraph that holds only an image", () => {
    for (const block of [
      `<img src="a.png" alt="a" class="zoomable" />`,
      `<video controls><source src="a.mp4" type="video/mp4"></source></video>`,
      "<hr>",
      `<p><img src="a.png" alt="a" /></p>`,
    ])
      expect(appendEndMark(`<p>text</p>${block}`)).toBe(
        `<p>text</p>${block}<p class="end-mark-line">${END_MARK}</p>`,
      );
  });
  it("a list whose last item ends in a nested list, or a quote ending in a non-paragraph, gets its own line", () => {
    const nested = "<ul><li>a<ul><li>b</li></ul></li></ul>";
    expect(appendEndMark(nested)).toBe(`${nested}<p class="end-mark-line">${END_MARK}</p>`);
    const q = "<blockquote><p>x</p><ul><li>y</li></ul></blockquote>";
    expect(appendEndMark(q)).toBe(`${q}<p class="end-mark-line">${END_MARK}</p>`);
  });
  it("adds exactly one mark, adds no text and changes nothing else", () => {
    for (const html of [
      "<p>a</p><p>b</p>",
      "<ul><li>x</li></ul>",
      `<p>a</p><div class="code-block"><pre><code>c</code></pre></div>`,
      `<h2 id="h"><a class="heading-anchor" href="#h">#</a>H</h2><p>p</p>`,
      "",
    ]) {
      const out = appendEndMark(html);
      expect(count(out)).toBe(1);
      expect(strip(out)).toBe(html);
      expect(out.replace(/<[^>]+>/g, "")).toBe(html.replace(/<[^>]+>/g, ""));
    }
  });
  it("is deterministic (server and client render the same string) and has a stable accessible name", () => {
    const html = "<p>x</p>";
    expect(appendEndMark(html)).toBe(appendEndMark(html));
    expect(END_MARK).toContain('role="img"');
    expect(END_MARK).toContain('aria-label="End of article"');
  });
});
