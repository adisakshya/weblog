import supplied from "./curated-content.json";

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
const FILES = new Set([
  "metamorphosis.jpg",
  "child-star.jpg",
  "pride-prejudice.jpg",
  "everything.jpg",
  "keeper.jpg",
  "clocks.jpg",
  "brief-time.jpg",
  "video-markov.jpg",
  "video-interpretability.jpg",
  "video-quantum.jpg",
]);
export const books: Book[] = supplied.books;
export const videos: Video[] = supplied.videos;
/** Recovered originals live in public/curated/ and are served under the site base path (/weblog/curated/...). */
export function curatedImage(filename: string): string {
  if (!FILES.has(filename)) throw new Error(`Missing curated image: ${filename}`);
  return `${import.meta.env.BASE_URL}curated/${filename}`;
}
export function personalThoughts(item: { thoughts?: string | null }): string | undefined {
  return item.thoughts?.trim() || undefined;
}
