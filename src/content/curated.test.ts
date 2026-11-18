import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { books, videos, curatedImage, personalThoughts } from "./curated";

// the formats curatedImage() accepts; kept in step with scripts/image-format.mjs (used by the release gates)
function imageKind(b: Buffer): string | null {
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return "jpg";
  if (b.subarray(0, 4).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47]))) return "png";
  if (
    b.subarray(0, 4).toString("latin1") === "RIFF" &&
    b.subarray(8, 12).toString("latin1") === "WEBP"
  )
    return "webp";
  return null;
}
const extensionKind = (f: string) => f.split(".").pop()!.toLowerCase().replace("jpeg", "jpg");

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
      // the file must really exist and be a JPEG, PNG or WebP matching its extension (not a pointer/metadata stub)
      const path = `public/curated/${filename}`;
      expect(existsSync(path), path).toBe(true);
      expect(imageKind(readFileSync(path)), `${path} is a real image`).toBe(
        extensionKind(filename),
      );
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
    // the originals carry none; an item the owner adds may carry some, shown exactly as written (trimmed)
    for (const item of [...books.slice(0, 7), ...videos.slice(0, 3)])
      expect(personalThoughts(item)).toBeUndefined();
    for (const item of [...books, ...videos])
      expect(personalThoughts(item)).toBe(item.thoughts?.trim() || undefined);
    expect(personalThoughts({})).toBeUndefined();
    expect(personalThoughts({ thoughts: "  " })).toBeUndefined();
    expect(personalThoughts({ thoughts: " My own reflection " })).toBe("My own reflection");
  });
});
