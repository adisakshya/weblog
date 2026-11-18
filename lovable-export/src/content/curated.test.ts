import { describe, expect, it } from "vitest";
import { books, videos, curatedImage, personalThoughts } from "./curated";

describe("owner-supplied curation", () => {
  it("keeps all seven books and three videos with attached images", () => {
    expect(books).toHaveLength(7);
    expect(videos).toHaveLength(3);
    for (const filename of [...books.map((b) => b.cover), ...videos.map((v) => v.thumbnail)]) {
      expect(curatedImage(filename)).toMatch(/^\/__l5e\/assets-v1\//);
    }
  });
  it("preserves the supplied YouTube timestamps", () => {
    expect(videos.map((v) => v.url)).toEqual([
      "https://www.youtube.com/watch?v=KZeIEiBrT_w&t=1448s",
      "https://www.youtube.com/watch?v=fGKNUvivvnc&t=11s",
      "https://www.youtube.com/watch?v=KfODG5REyss",
    ]);
  });
  it("only exposes personal thoughts when actually supplied", () => {
    for (const item of [...books, ...videos]) expect(personalThoughts(item)).toBeUndefined();
    expect(personalThoughts({})).toBeUndefined();
    expect(personalThoughts({ thoughts: "  " })).toBeUndefined();
    expect(personalThoughts({ thoughts: " My own reflection " })).toBe("My own reflection");
  });
});