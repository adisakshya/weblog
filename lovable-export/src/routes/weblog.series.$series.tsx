import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { series } from "@/content/content";
import { postParams } from "@/content/links";
import { PostMeta } from "@/components/journal/PostMeta";
import { Cover } from "@/components/journal/Cover";

export const Route = createFileRoute("/weblog/series/$series")({
  loader: ({ params }) => {
    if (!series.some((s) => s.slug === params.series)) throw notFound();
    return { slug: params.series };
  },
  head: ({ loaderData }) => {
    const s = series.find((x) => x.slug === loaderData?.slug);
    return {
      meta: [
        { title: `${s?.title ?? "Series"} - The blog of Adisakshya Chauhan` },
        { name: "description", content: s?.excerpt ?? "" },
        { property: "og:title", content: s?.title ?? "Series" },
        { property: "og:description", content: s?.excerpt ?? "" },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary" },
      ],
      links: s ? [{ rel: "canonical", href: `https://adisakshya.github.io/weblog/series/${s.slug}/` }] : [],
    };
  },
  component: SeriesPage,
});

function SeriesPage() {
  const { slug } = Route.useLoaderData();
  const s = series.find((x) => x.slug === slug)!;
  return (
    <div className="mx-auto max-w-3xl px-4 pt-8 sm:px-6">
      <Link to="/weblog" className="text-sm">← All writing</Link>
      <p className="mt-6 text-xs font-semibold uppercase tracking-widest j-muted">Series · {s.posts.length} parts · read in order</p>
      <h1 className="mt-1 text-3xl font-bold sm:text-4xl">{s.title}</h1>
      <p className="mt-3 text-lg j-muted">{s.excerpt}</p>
      <ol className="mt-8 space-y-8">
        {s.posts.map((p, i) => (
          <li key={p.url} className="grid gap-4 sm:grid-cols-[12rem_1fr]">
            <Cover slug={p.slug} />
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest j-muted">Part {i + 1}</p>
              <h2 className="mt-1 text-xl font-bold"><Link to="/weblog/$year/$month/$day/$file" params={postParams(p)}>{p.title}</Link></h2>
              <p className="mt-1 j-muted">{p.excerpt}</p>
              <div className="mt-2"><PostMeta post={p} /></div>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
