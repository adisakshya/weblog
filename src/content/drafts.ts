// Unlisted drafts preview (/weblog/drafts/). Reads _drafts/*.md at build time with the same renderer as published posts.
// Drafts never enter `posts`, the tag/series pages, the search index, sitemap.xml or feed.xml: only the drafts routes import this module.
// A file whose name starts with "_" is held back: it is not matched here, so it is never bundled or built.
import { buildPost, splitFrontMatter, BASE, type Post } from "./content";

const draftFiles = import.meta.glob(["/_drafts/*.md", "!/_drafts/_*.md"], {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

export type Draft = Post & {
  /** The Markdown file as committed, e.g. _drafts/2026-11-20-my-post.md */
  file: string;
  /** What is still missing before the post can be published. */
  missing: string[];
};

export const draftUrl = (slug: string) => `${BASE}/drafts/${slug}/`;

export function buildDraft(path: string, raw: string): Draft {
  const { data } = splitFrontMatter(raw);
  const post = buildPost(path, raw);
  const hasTitle = typeof data.title === "string" && data.title.trim() !== "";
  const missing = [
    ...(hasTitle ? [] : ["title"]),
    ...(post.excerpt ? [] : ["excerpt"]),
    ...(post.tags.length ? [] : ["tags"]),
    ...(post.teaser ? [] : ["teaser image"]),
  ];
  return {
    ...post,
    title: hasTitle ? post.title : post.slug.replace(/-/g, " "),
    url: draftUrl(post.slug),
    file: path.replace(/^\//, ""),
    missing,
  };
}

/** Two drafts that differ only by date share a URL (the date is not part of it), so one would be unreachable. Fail the build instead. */
export function assertUniqueSlugs(list: Pick<Draft, "slug" | "file">[]) {
  const seen = new Map<string, string>();
  for (const d of list) {
    const other = seen.get(d.slug);
    if (other)
      throw new Error(
        `duplicate draft slug '${d.slug}': ${other} and ${d.file} both map to ${draftUrl(d.slug)}. Rename one of them.`,
      );
    seen.set(d.slug, d.file);
  }
}

export const drafts: Draft[] = (() => {
  const list = Object.entries(draftFiles)
    .map(([path, raw]) => buildDraft(path, raw))
    .sort((a, b) => b.date.localeCompare(a.date));
  assertUniqueSlugs(list);
  return list;
})();

export const findDraft = (slug: string) => drafts.find((d) => d.slug === slug);
