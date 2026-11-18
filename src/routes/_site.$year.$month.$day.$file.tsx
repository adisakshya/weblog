import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { findPost, posts, seriesFor } from "@/content/content";
import { postParams } from "@/content/links";
import { Cover } from "@/components/journal/Cover";
import { PostMeta } from "@/components/journal/PostMeta";
import { ArticleBody } from "@/components/journal/ArticleBody";

export const Route = createFileRoute("/_site/$year/$month/$day/$file")({
  loader: ({ params }) => {
    const post = findPost(`/weblog/${params.year}/${params.month}/${params.day}/${params.file}`);
    if (!post) throw notFound();
    return { url: post.url };
  },
  head: ({ loaderData }) => {
    const p = loaderData && findPost(loaderData.url);
    if (!p)
      return { meta: [{ title: "Article not found" }, { name: "robots", content: "noindex" }] };
    const img = p.teaser?.startsWith("https://") ? p.teaser : undefined;
    return {
      meta: [
        { title: `${p.title} - The blog of Adisakshya Chauhan` },
        { name: "description", content: p.excerpt },
        { property: "og:title", content: p.title },
        { property: "og:description", content: p.excerpt },
        { property: "og:type", content: "article" },
        { property: "article:published_time", content: p.date },
        { name: "twitter:card", content: "summary_large_image" },
        ...(img
          ? [
              { property: "og:image", content: img },
              { name: "twitter:image", content: img },
            ]
          : []),
      ],
      links: [{ rel: "canonical", href: `https://adisakshya.github.io${p.url}` }],
    };
  },
  notFoundComponent: () => (
    <div className="mx-auto max-w-xl px-4 py-20 text-center">
      <h1 className="text-3xl font-bold">Page not found</h1>
      <p className="mt-2 j-muted">This article doesn’t exist.</p>
      <Link to="/" className="j-btn mt-6">
        All writing
      </Link>
    </div>
  ),
  component: Article,
});

function Article() {
  const { url } = Route.useLoaderData();
  const post = findPost(url)!;
  const s = seriesFor(post);
  const idx = s ? s.posts.indexOf(post) : -1;
  const prev = s && idx > 0 ? s.posts[idx - 1] : undefined;
  const next = s && idx < s.posts.length - 1 ? s.posts[idx + 1] : undefined;
  const related = posts.filter((p) => p !== post && !s?.posts.includes(p)).slice(0, 2);

  return (
    <article className="px-4 sm:px-6">
      <div className="j-measure pt-8">
        <Link to="/" className="text-[0.85rem]">
          ← All writing
        </Link>
        <p className="mt-6 flex flex-wrap gap-x-2 text-[0.8rem] font-semibold uppercase tracking-widest j-muted">
          {s && (
            <Link
              to="/series/$series"
              params={{ series: s.slug }}
              className="plain hover:underline"
            >
              {s.title} · Part {idx + 1} of {s.posts.length}
            </Link>
          )}
          {!s && post.tags[0] && <span>#{post.tags[0]}</span>}
        </p>
        <h1 className="mt-2 text-[2em] font-bold leading-[1.15] sm:text-[2.4em]">{post.title}</h1>
        <p className="mt-3 text-[1.05em] j-muted">{post.excerpt}</p>
        <p className="mt-4 text-[0.85rem]">
          By <a href="https://adisakshya.github.io/">Adisakshya Chauhan</a>
        </p>
        <div className="mt-1">
          <PostMeta post={post} allTags />
        </div>
      </div>
      <div className="mx-auto mt-8 max-w-3xl">
        <Cover slug={post.slug} />
      </div>
      <div className="j-measure">
        {post.headings.length > 1 && (
          <details className="mt-8 rounded-xl border j-border text-[0.85rem]">
            <summary className="cursor-pointer select-none px-4 py-3 font-semibold">
              On this page
            </summary>
            <ol className="space-y-1.5 px-4 pb-4">
              {post.headings.map((h) => (
                <li key={h.id} style={{ paddingLeft: h.depth === 3 ? "1rem" : 0 }}>
                  <a href={`#${h.id}`}>{h.text}</a>
                </li>
              ))}
            </ol>
          </details>
        )}
      </div>
      <div className="mt-8">
        <ArticleBody html={post.html} />
      </div>

      <div className="j-measure mt-14 space-y-10 !text-base">
        {s && (
          <nav aria-label={`${s.title} series`} className="rounded-2xl j-panel p-5">
            <p className="text-xs font-semibold uppercase tracking-widest j-muted">
              {s.title} · Part {idx + 1} of {s.posts.length}
            </p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {prev ? (
                <Link
                  to="/$year/$month/$day/$file"
                  params={postParams(prev)}
                  className="plain rounded-xl border j-border p-3 hover:border-[var(--j-accent)]"
                >
                  <span className="text-xs j-muted">← Previous</span>
                  <span className="block font-semibold">{prev.title}</span>
                </Link>
              ) : (
                <span />
              )}
              {next ? (
                <Link
                  to="/$year/$month/$day/$file"
                  params={postParams(next)}
                  className="plain rounded-xl border j-border p-3 text-right hover:border-[var(--j-accent)]"
                >
                  <span className="text-xs j-muted">Next →</span>
                  <span className="block font-semibold">{next.title}</span>
                </Link>
              ) : (
                <span className="self-center text-sm j-muted sm:text-right">
                  This is the latest part.
                </span>
              )}
            </div>
            <Link
              to="/series/$series"
              params={{ series: s.slug }}
              className="mt-3 inline-block text-sm"
            >
              View the full series
            </Link>
          </nav>
        )}

        {related.length > 0 && (
          <section aria-labelledby="related-h">
            <h2 id="related-h" className="text-lg font-bold">
              More writing
            </h2>
            <ul className="mt-3 space-y-3">
              {related.map((p) => (
                <li key={p.url}>
                  <Link
                    to="/$year/$month/$day/$file"
                    params={postParams(p)}
                    className="font-semibold"
                  >
                    {p.title}
                  </Link>
                  <p className="text-sm j-muted">{p.excerpt}</p>
                </li>
              ))}
            </ul>
          </section>
        )}

        <Link to="/" className="inline-block text-sm">
          ← All writing
        </Link>
      </div>
    </article>
  );
}
