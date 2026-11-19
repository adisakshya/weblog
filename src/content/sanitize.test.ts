import { describe, expect, it } from "vitest";
import { posts, renderMarkdown, sanitizePostHtml } from "./content";

describe("post HTML is sanitized (untrusted Markdown/HTML boundary)", () => {
  const html = (md: string) => renderMarkdown(md).html;

  it("drops script tags and event-handler attributes", () => {
    expect(html("<script>alert(1)</script>hi")).not.toMatch(/<script|alert\(1\)/);
    const out = html('<img src="https://x.test/a.png" onerror="alert(1)" alt="a">');
    expect(out).not.toMatch(/onerror/);
    expect(out).toContain('src="https://x.test/a.png"');
  });
  it("drops javascript: and data: URLs in links and media", () => {
    expect(html("[x](javascript:alert(1))")).not.toMatch(/javascript:/);
    expect(html('<a href="JaVaScRiPt:alert(1)">x</a>')).not.toMatch(/javascript:/i);
    expect(html('<img src="data:text/html;base64,AAAA">')).not.toMatch(/data:/);
    expect(html('<video src="javascript:alert(1)"></video>')).not.toMatch(/javascript:/);
  });
  it("drops iframes, objects, embeds, forms, styles and svg", () => {
    for (const tag of [
      "iframe",
      "object",
      "embed",
      "form",
      "style",
      "svg",
      "math",
      "base",
      "meta",
      "link",
    ]) {
      expect(html(`<${tag} src="https://x.test"></${tag}>text`), tag).not.toMatch(
        new RegExp(`<${tag}`),
      );
    }
  });
  it("forces rel=noopener noreferrer on target=_blank links", () => {
    expect(html('<a href="https://x.test" target="_blank">x</a>')).toContain(
      'rel="noopener noreferrer"',
    );
    expect(html("[x](https://x.test)")).toContain('rel="noopener noreferrer"');
  });
  it("keeps the markup existing posts rely on (video + source, code, headings, tables, images)", () => {
    const out = html(
      '<video width="100%" height="auto" controls muted><source src="https://x.test/a.webm" type="video/webm"></video>\n\n## Heading\n\n```js\nconst a = 1;\n```\n\n| a | b |\n|---|---|\n| 1 | 2 |\n\n![alt](https://x.test/i.png)',
    );
    expect(out).toContain("<video");
    expect(out).toContain('<source src="https://x.test/a.webm" type="video/webm"');
    expect(out).toContain('<h2 id="heading"');
    expect(out).toContain("<table");
    expect(out).toContain('class="zoomable"');
    expect(out).toMatch(/;\n<\/code>/);
  });
  it("leaves every real post's media intact", () => {
    const ext = posts.find((p) => p.slug.startsWith("extension-pack"))!;
    expect(ext.html.match(/<video/g)).toHaveLength(2);
    expect(ext.html.match(/<source /g)).toHaveLength(2);
  });
  it("sanitizePostHtml is idempotent on its own output", () => {
    const once = sanitizePostHtml('<p onclick="x()">a <b>b</b></p><script>1</script>');
    expect(sanitizePostHtml(once)).toBe(once);
  });
});
