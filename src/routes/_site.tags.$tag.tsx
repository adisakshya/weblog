import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { posts, tags, tagPages } from "@/content/content";
import { postParams } from "@/content/links";
import { PostMeta } from "@/components/journal/PostMeta";

export const Route = createFileRoute("/_site/tags/$tag")({
  loader: ({ params }) => {
    if (!tags.includes(params.tag)) throw notFound();
    return { tag: params.tag };
  },
  head: ({ params }) => ({
    meta: [
      {
        title: `${tagPages.find((t) => t.tag === params.tag)?.title ?? `#${params.tag}`} — Adisakshya Chauhan`,
      },
      {
        name: "description",
        content: `Articles tagged ${params.tag} on the blog of Adisakshya Chauhan.`,
      },
      { property: "og:title", content: `#${params.tag}` },
      { property: "og:description", content: `Articles tagged ${params.tag}.` },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: `https://adisakshya.github.io/weblog/tags/${params.tag}/` }],
  }),
  component: TagPage,
});

function TagPage() {
  const { tag } = Route.useLoaderData();
  const list = posts.filter((p) => p.tags.includes(tag));
  return (
    <div className="mx-auto max-w-3xl px-4 pt-8 sm:px-6">
      <Link to="/" className="text-sm">
        ← All writing
      </Link>
      <h1 className="mt-6 text-3xl font-bold">#{tag}</h1>
      <p className="mt-1 j-muted">
        {list.length} article{list.length > 1 ? "s" : ""}
      </p>
      <ul className="mt-6 divide-y divide-[var(--j-border)] border-t j-border">
        {list.map((p) => (
          <li key={p.url} className="py-5">
            <Link
              to="/$year/$month/$day/$file"
              params={postParams(p)}
              className="text-xl font-semibold"
            >
              {p.title}
            </Link>
            <p className="mt-1 j-muted">{p.excerpt}</p>
            <div className="mt-2">
              <PostMeta post={p} />
            </div>
          </li>
        ))}
      </ul>
      <h2 className="mt-12 text-sm font-semibold uppercase tracking-widest j-muted">All topics</h2>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {tags.map((t) => (
          <Link
            key={t}
            to="/tags/$tag"
            params={{ tag: t }}
            className="j-chip"
            aria-current={t === tag ? "page" : undefined}
          >
            #{t}
          </Link>
        ))}
      </div>
    </div>
  );
}
