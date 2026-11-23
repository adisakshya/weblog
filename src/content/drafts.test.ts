import { describe, expect, it } from "vitest";
import { assertUniqueSlugs, buildDraft, draftUrl } from "./drafts";

const raw = (front: string) => `---\n${front}\n---\n\nBody text here.\n`;

describe("buildDraft", () => {
  it("lists what is missing before a post can be published", () => {
    const d = buildDraft("/_drafts/2026-11-20-bare.md", raw("date: 2026-11-20 10:00:00 +0530"));
    expect(d.missing).toEqual(["title", "excerpt", "tags", "teaser image"]);
    expect(d.title).toBe("bare"); // falls back to the file name
  });

  it("has nothing missing when the front matter is complete", () => {
    const d = buildDraft(
      "/_drafts/2026-11-20-complete.md",
      raw(
        'title: "Complete"\ndate: 2026-11-20 10:00:00 +0530\ntags: [a]\nexcerpt: Done.\nheader:\n  teaser: "https://example.com/x.png"',
      ),
    );
    expect(d.missing).toEqual([]);
    expect(d.title).toBe("Complete");
  });

  it("serves a draft at /weblog/drafts/<slug>/ and never at a dated post URL", () => {
    const d = buildDraft("/_drafts/2026-11-20-my-post.md", raw("title: X\ndate: 2026-11-20"));
    expect(d.url).toBe(draftUrl("my-post"));
    expect(d.url).toBe("/weblog/drafts/my-post/");
    expect(d.file).toBe("_drafts/2026-11-20-my-post.md");
  });
});

describe("assertUniqueSlugs", () => {
  it("throws, naming both files, when two drafts differ only by date", () => {
    const a = buildDraft("/_drafts/2026-11-20-update.md", raw("title: A\ndate: 2026-11-20"));
    const b = buildDraft("/_drafts/2026-11-23-update.md", raw("title: B\ndate: 2026-11-23"));
    expect(() => assertUniqueSlugs([a, b])).toThrow(
      /duplicate draft slug 'update'.*2026-11-20-update\.md.*2026-11-23-update\.md/,
    );
  });

  it("accepts distinct slugs", () => {
    const a = buildDraft("/_drafts/2026-11-20-one.md", raw("title: A\ndate: 2026-11-20"));
    const b = buildDraft("/_drafts/2026-11-20-two.md", raw("title: B\ndate: 2026-11-20"));
    expect(() => assertUniqueSlugs([a, b])).not.toThrow();
  });
});
