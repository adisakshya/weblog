import { describe, expect, it } from "vitest";
import { readdirSync, readFileSync } from "node:fs";
import { posts, rehostedImage } from "./content";

const IMGIX = /https:\/\/hackernoon\.imgix\.net[^)\s"]*/g;

describe("images of imported posts", () => {
  const sources = readdirSync("_posts").map(
    (f) => [f, readFileSync(`_posts/${f}`, "utf8")] as const,
  );

  it("every imgix URL used in a post resolves to the owner's Cloudinary", () => {
    const urls = sources.flatMap(([, md]) => md.match(IMGIX) ?? []);
    expect(urls.length).toBeGreaterThan(0);
    for (const u of urls) {
      expect(rehostedImage(u), u).toMatch(/^https:\/\/res\.cloudinary\.com\/adisakshya\//);
    }
  });

  it("no rendered post or teaser still points at hackernoon.imgix.net, while the Markdown keeps the original URLs", () => {
    for (const p of posts) {
      expect(p.html, p.slug).not.toContain("hackernoon.imgix.net");
      expect(p.teaser ?? "", p.slug).not.toContain("hackernoon.imgix.net");
    }
    expect(sources.some(([, md]) => md.includes("hackernoon.imgix.net"))).toBe(true);
  });

  it("leaves every other URL as authored", () => {
    expect(rehostedImage("https://example.com/a.png")).toBe("https://example.com/a.png");
    expect(rehostedImage("/relative.png")).toBe("/relative.png");
    expect(rehostedImage("https://hackernoon.imgix.net/images/unknown.png")).toBe(
      "https://hackernoon.imgix.net/images/unknown.png",
    );
  });
});
