import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Cover } from "./Cover";
import { posts } from "@/content/content";

describe("Cover", () => {
  it("keeps the hand-made artwork for the three original posts", () => {
    const { container } = render(<Cover slug="extension-pack-for-vscode-and-code-server" />);
    expect(container.querySelector("svg")).not.toBeNull();
  });

  it("never shows another post's artwork: an imported post uses its own teaser (served from Cloudinary)", () => {
    const p = posts.find((x) => x.slug.startsWith("understanding-python-memory"))!;
    const { container } = render(<Cover slug={p.slug} title={p.title} teaser={p.teaser} />);
    expect(container.querySelector("svg")).toBeNull();
    const img = screen.getByRole("img", { name: /Understanding Python Memory/ });
    expect(img.getAttribute("src")).toMatch(/^https:\/\/res\.cloudinary\.com\/adisakshya\//);
  });

  it("falls back to a titled tile, not to artwork, when a post has no image", () => {
    const { container } = render(<Cover slug="no-image-post" title="No image post" />);
    expect(container.querySelector("svg")).toBeNull();
    expect(screen.getByText("No image post")).toBeTruthy();
  });
});
