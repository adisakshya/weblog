import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { books, videos, curatedImage, personalThoughts } from "./curated";

const ORIGINAL_BOOK_IDS = [
  "metamorphosis",
  "child-star",
  "pride-prejudice",
  "everything",
  "keeper",
  "clocks",
  "brief-time",
];

describe("owner-supplied curation", () => {
  it("keeps the original seven books and three videos, plus any the owner adds, with attached images", () => {
    // a floor, not an exact count: adding a book or video through _data/curated-content.json must not need a code change
    expect(books.length).toBeGreaterThanOrEqual(7);
    expect(videos.length).toBeGreaterThanOrEqual(3);
    expect(books.slice(0, 7).map((b) => b.id)).toEqual(ORIGINAL_BOOK_IDS);
    for (const filename of [...books.map((b) => b.cover), ...videos.map((v) => v.thumbnail)]) {
      expect(curatedImage(filename)).toBe(`${import.meta.env.BASE_URL}curated/${filename}`);
      // the file must really exist and be a JPEG (not a pointer/metadata stub)
      const path = `public/curated/${filename}`;
      expect(existsSync(path), path).toBe(true);
      expect(readFileSync(path).subarray(0, 3)).toEqual(Buffer.from([0xff, 0xd8, 0xff]));
    }
  });
  it("preserves the supplied YouTube timestamps", () => {
    expect(videos.slice(0, 3).map((v) => v.url)).toEqual([
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
