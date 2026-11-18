import supplied from "./curated-content.json";
import metamorphosis from "@/assets/curated/metamorphosis.jpg.asset.json";
import childStar from "@/assets/curated/child-star.jpg.asset.json";
import pride from "@/assets/curated/pride-prejudice.jpg.asset.json";
import everything from "@/assets/curated/everything.jpg.asset.json";
import keeper from "@/assets/curated/keeper.jpg.asset.json";
import clocks from "@/assets/curated/clocks.jpg.asset.json";
import briefTime from "@/assets/curated/brief-time.jpg.asset.json";
import markov from "@/assets/curated/video-markov.jpg.asset.json";
import interpretability from "@/assets/curated/video-interpretability.jpg.asset.json";
import quantum from "@/assets/curated/video-quantum.jpg.asset.json";

export type Book = { id: string; title: string; author: string; cover: string; url: string; thoughts?: string | null };
export type Video = { id: string; title: string; creator: string; thumbnail: string; url: string; thoughts?: string | null };
const images: Record<string, { url: string }> = {
  "metamorphosis.jpg": metamorphosis, "child-star.jpg": childStar, "pride-prejudice.jpg": pride,
  "everything.jpg": everything, "keeper.jpg": keeper, "clocks.jpg": clocks, "brief-time.jpg": briefTime,
  "video-markov.jpg": markov, "video-interpretability.jpg": interpretability, "video-quantum.jpg": quantum,
};
export const books: Book[] = supplied.books;
export const videos: Video[] = supplied.videos;
export function curatedImage(filename: string): string {
  const image = images[filename];
  if (!image) throw new Error(`Missing curated image: ${filename}`);
  return image.url;
}
export function personalThoughts(item: { thoughts?: string | null }): string | undefined {
  return item.thoughts?.trim() || undefined;
}