import supplied from "../../_data/curated-content.json";

export type Book = {
  id: string;
  title: string;
  author: string;
  cover: string;
  url: string;
  thoughts?: string | null;
};
export type Video = {
  id: string;
  title: string;
  creator: string;
  thumbnail: string;
  url: string;
  thoughts?: string | null;
};
export const books: Book[] = supplied.books;
export const videos: Video[] = supplied.videos;
/** Covers and thumbnails live in public/curated/ and are served at /weblog/curated/<file>. To add an entry: put the image there and reference its file name in _data/curated-content.json (curated.test.ts checks every reference exists and is a real JPEG). */
export function curatedImage(filename: string): string {
  if (!/^[\w.-]+\.(jpe?g|png|webp)$/i.test(filename))
    throw new Error(`Invalid curated image name: ${filename}`);
  return `${import.meta.env.BASE_URL}curated/${filename}`;
}
export function personalThoughts(item: { thoughts?: string | null }): string | undefined {
  return item.thoughts?.trim() || undefined;
}
