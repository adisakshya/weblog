import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { shareImageMeta } from "@/content/site";
import { findDraft, drafts } from "@/content/drafts";
import { Cover } from "@/components/journal/Cover";
import { hasArtwork } from "@/components/journal/artwork";
import { ArticleBody } from "@/components/journal/ArticleBody";
import { NotFoundPage } from "@/components/journal/NotFound";
import { notFoundMeta } from "@/lib/not-found";
import { formatDate } from "@/content/content";

export const Route = createFileRoute("/_site/drafts/$slug")({
  loader: ({ params }) => {
    if (!findDraft(params.slug)) throw notFound();
    return { slug: params.slug };
  },
  head: ({ loaderData }) => {
    const d = loaderData && findDraft(loaderData.slug);
    if (!d) return { meta: notFoundMeta };
    // no canonical and no article:published_time: a draft has no public address
    return {
      meta: [
        { title: `Draft: ${d.title} — Adisakshya Chauhan` },
        { name: "description", content: d.excerpt },
        { name: "robots", content: "noindex,nofollow" },
        ...shareImageMeta(),
      ],
    };
  },
  notFoundComponent: NotFoundPage,
  component: DraftArticle,
});

function DraftArticle() {
  const { slug } = Route.useLoaderData();
  const post = findDraft(slug)!;
  const checks: [string, boolean][] = [
    ["Title", !post.missing.includes("title")],
    ["Excerpt", !post.missing.includes("excerpt")],
    ["Tags", !post.missing.includes("tags")],
    ["Teaser image", !post.missing.includes("teaser image")],
  ];
  const related = drafts.filter((d) => d !== post).slice(0, 2);
  return (
    <article className="px-4 sm:px-6">
      <div className="j-measure pt-8">
        <p className="j-draft-bar" role="note">
          <strong>Draft preview</strong>
          <span>Not published. Readers cannot see this page.</span>
          <Link to="/drafts" className="ml-auto">
            Back to drafts
          </Link>
        </p>
        <ul
          aria-label="Before publishing"
          className="mt-4 grid grid-cols-2 gap-x-4 gap-y-1 rounded-xl border j-border p-3 text-[0.8rem] sm:grid-cols-4"
        >
          {checks.map(([label, ok]) => (
            <li key={label}>
              <span aria-hidden="true">{ok ? "✓ " : "○ "}</span>
              {label}
              <span className="sr-only">{ok ? ": done" : ": missing"}</span>
            </li>
          ))}
        </ul>
        <p className="mt-2 text-[0.8rem] j-muted">
          Source: <code>{post.file}</code>
        </p>
        <h1 className="mt-6 text-[2em] font-bold leading-[1.15] sm:text-[2.4em]">{post.title}</h1>
        {post.excerpt && <p className="mt-3 text-[1.05em] j-muted">{post.excerpt}</p>}
        <p className="mt-4 text-[0.85rem]">By Adisakshya Chauhan</p>
        <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm j-muted">
          <time dateTime={post.date}>{formatDate(post.date)}</time>
          <span aria-hidden="true">·</span>
          <span>{post.readingTime} min read</span>
          {post.tags.map((t) => (
            <span key={t} className="j-chip">
              #{t}
            </span>
          ))}
        </p>
      </div>
      <div className="mx-auto mt-8 max-w-3xl">
        {hasArtwork(post.slug) ? (
          <Cover slug={post.slug} />
        ) : post.teaser ? (
          <Cover slug={post.slug} title={post.title} teaser={post.teaser} />
        ) : (
          <p className="rounded-xl j-panel p-6 text-center text-sm j-muted">
            No teaser image yet. Add <code>header.teaser</code> to the front matter.
          </p>
        )}
      </div>
      <div className="mt-8">
        <ArticleBody html={post.html} endMark />
      </div>
      <div className="j-measure mt-14 space-y-10 !text-base">
        {related.length > 0 && (
          <section aria-labelledby="related-h">
            <h2 id="related-h" className="text-lg font-bold">
              Other drafts
            </h2>
            <ul className="mt-3 space-y-3">
              {related.map((p) => (
                <li key={p.slug}>
                  <Link to="/drafts/$slug" params={{ slug: p.slug }} className="font-semibold">
                    {p.title}
                  </Link>
                  <p className="text-sm j-muted">{p.excerpt}</p>
                </li>
              ))}
            </ul>
          </section>
        )}
        <Link to="/drafts" className="inline-block text-sm">
          ← All drafts
        </Link>
      </div>
    </article>
  );
}
