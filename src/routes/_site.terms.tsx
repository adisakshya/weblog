import { createFileRoute, Link } from "@tanstack/react-router";
import { shareImageMeta } from "@/content/site";
import { pages } from "@/content/content";
import { ArticleBody } from "@/components/journal/ArticleBody";

export const Route = createFileRoute("/_site/terms")({
  head: () => ({
    meta: [
      { title: "Terms and policies — Adisakshya Chauhan" },
      { name: "description", content: pages["terms"]!.excerpt ?? "" },
      { property: "og:title", content: "Terms and policies" },
      { property: "og:description", content: pages["terms"]!.excerpt ?? "" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      ...shareImageMeta(),
    ],
    links: [{ rel: "canonical", href: "https://adisakshya.github.io/weblog/terms/" }],
  }),
  component: () => {
    const p = pages["terms"]!;
    return (
      <div className="px-4 pt-8 sm:px-6">
        <div className="j-measure">
          <Link to="/" className="text-[0.85rem]">
            ← All writing
          </Link>
          <h1 className="mt-6 text-[2em] font-bold leading-tight">{p.title}</h1>
          {p.excerpt && <p className="mt-3 j-muted">{p.excerpt}</p>}
        </div>
        <div className="mt-8">
          <ArticleBody html={p.html} />
        </div>
      </div>
    );
  },
});
