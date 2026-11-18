import { createFileRoute, Link } from "@tanstack/react-router";
import { posts, series, groupings, subjects, formatShortDate, type Post } from "@/content/content";
import { postParams } from "@/content/links";
import { Cover } from "@/components/journal/Cover";
import { PostMeta } from "@/components/journal/PostMeta";
import { CuratedSections } from "@/components/journal/CuratedSections";

type Search = { view?: "stories" | "subjects" | "index" };

export const Route = createFileRoute("/_site/")({
  validateSearch: (s: Record<string, unknown>): Search =>
    s["view"] === "index" || s["view"] === "subjects" ? { view: s["view"] } : {},
  head: () => ({
    meta: [
      { title: "The blog of Adisakshya Chauhan" },
      {
        name: "description",
        content:
          "A compilation of Adisakshya’s musings, inspirations, mistakes, and other ramblings — on API gateways, microservices and developer tools.",
      },
      { property: "og:title", content: "The blog of Adisakshya Chauhan" },
      {
        property: "og:description",
        content:
          "A compilation of Adisakshya’s musings, inspirations, mistakes, and other ramblings.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://adisakshya.github.io/weblog/" }],
  }),
  component: Home,
});

function PostLink({
  post,
  className,
  children,
}: {
  post: Post;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Link to="/$year/$month/$day/$file" params={postParams(post)} className={className}>
      {children}
    </Link>
  );
}

function Home() {
  const { view = "stories" } = Route.useSearch();
  const lead = posts[0];
  const rest = posts.slice(1);
  const gw = series[0];
  if (!lead || !gw) return null;
  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6">
      <div className="flex flex-col gap-4 pt-8 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <p className="max-w-xl text-lg j-muted">
          A compilation of my musings 🤔, inspirations 🌟, mistakes 😅, and other ramblings 🧐.
        </p>
        <div role="group" aria-label="Choose view" className="flex gap-1.5 shrink-0">
          <Link
            to="/"
            search={{}}
            aria-label="Posts"
            aria-pressed={view === "stories"}
            className="j-ghost plain text-sm"
          >
            Posts
          </Link>
          <Link
            to="/"
            search={{ view: "subjects" }}
            aria-pressed={view === "subjects"}
            className="j-ghost plain text-sm"
          >
            Subjects
          </Link>
          <Link
            to="/"
            search={{ view: "index" }}
            aria-pressed={view === "index"}
            className="j-ghost plain text-sm"
          >
            Index
          </Link>
        </div>
      </div>

      {view === "stories" ? (
        <>
          <section aria-labelledby="latest" className="grid gap-8 lg:grid-cols-[1.35fr_1fr]">
            <h2 id="latest" className="sr-only">
              Latest writing
            </h2>
            <article className="group">
              <PostLink post={lead} className="plain block">
                <Cover
                  slug={lead.slug}
                  className="transition-transform duration-200 group-hover:-translate-y-0.5"
                />
              </PostLink>
              <p className="mt-4 text-xs font-semibold uppercase tracking-widest j-muted">
                Latest{lead.series ? ` · ${gw.title}, part ${gw.posts.indexOf(lead) + 1}` : ""}
              </p>
              <h3 className="mt-1 text-3xl font-bold leading-tight sm:text-4xl">
                <PostLink post={lead} className="plain hover:underline">
                  {lead.title}
                </PostLink>
              </h3>
              <p className="mt-3 text-lg j-muted">{lead.excerpt}</p>
              <div className="mt-3">
                <PostMeta post={lead} />
              </div>
              <PostLink post={lead} className="j-btn mt-5">
                Read the article <span aria-hidden="true">→</span>
              </PostLink>
            </article>
            <div className="flex flex-col gap-8">
              {rest.map((p) => (
                <article
                  key={p.url}
                  className="group grid grid-cols-[8rem_1fr] gap-4 sm:grid-cols-[11rem_1fr]"
                >
                  <PostLink post={p} className="plain">
                    <Cover slug={p.slug} />
                  </PostLink>
                  <div>
                    <h3 className="text-xl font-bold leading-snug">
                      <PostLink post={p} className="plain hover:underline">
                        {p.title}
                      </PostLink>
                    </h3>
                    <p className="mt-1.5 text-sm j-muted line-clamp-3">{p.excerpt}</p>
                    <div className="mt-2">
                      <PostMeta post={p} tags={false} />
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section aria-labelledby="series-h" className="mt-16 rounded-2xl j-panel p-6 sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-widest j-muted">
              Series · {gw.posts.length} parts
            </p>
            <h2 id="series-h" className="mt-1 text-2xl font-bold">
              <Link
                to="/series/$series"
                params={{ series: gw.slug }}
                className="plain hover:underline"
              >
                {gw.title}
              </Link>
            </h2>
            <p className="mt-2 max-w-2xl j-muted">{gw.excerpt}</p>
            <ol className="mt-5 grid gap-3 sm:grid-cols-2">
              {gw.posts.map((p, i) => (
                <li key={p.url}>
                  <PostLink
                    post={p}
                    className="plain flex items-center gap-3 rounded-xl border j-border p-3 hover:border-[var(--j-accent)]"
                  >
                    <span className="j-lime grid h-8 w-8 shrink-0 place-items-center rounded-full font-bold">
                      {i + 1}
                    </span>
                    <span className="font-semibold">{p.title}</span>
                  </PostLink>
                </li>
              ))}
            </ol>
          </section>

          <section aria-labelledby="topics-h" className="mt-16">
            <h2 id="topics-h" className="text-2xl font-bold">
              Explore by subject
            </h2>
            <div className="mt-5 grid gap-6 md:grid-cols-2">
              {groupings.map((g) => (
                <div key={g.label} className="rounded-2xl border j-border p-6">
                  <h3 className="text-lg font-bold">{g.label}</h3>
                  <p className="mt-1 text-sm j-muted">
                    {g.posts.length} article{g.posts.length > 1 ? "s" : ""}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {g.tags.map((t) => (
                      <Link key={t} to="/tags/$tag" params={{ tag: t }} className="j-chip">
                        #{t}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
          <CuratedSections />
        </>
      ) : view === "subjects" ? (
        <section aria-labelledby="subjects-h">
          <h2 id="subjects-h" className="sr-only">
            Writing by subject
          </h2>
          <ul className="border-t j-border">
            {subjects.map((g) => (
              <li key={g.label} className="border-b j-border">
                <details className="group py-5">
                  <summary className="cursor-pointer list-none">
                    <span className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                      <span className="text-xl font-bold group-open:underline">{g.label}</span>
                      <span className="text-sm j-muted">
                        {g.posts.length} post{g.posts.length > 1 ? "s" : ""}
                        {g.newest ? ` · ${formatShortDate(g.newest)}` : ""}
                      </span>
                    </span>
                    <span className="mt-1 block j-muted">{g.description}</span>
                  </summary>
                  <ul className="mt-4 space-y-3 sm:pl-6">
                    {g.posts.map((p) => (
                      <li key={p.url}>
                        <PostLink post={p} className="plain group/p block">
                          <span className="text-lg font-semibold group-hover/p:underline">
                            {p.title}
                          </span>
                        </PostLink>
                        <div className="mt-1">
                          <PostMeta post={p} />
                        </div>
                      </li>
                    ))}
                  </ul>
                </details>
              </li>
            ))}
          </ul>
        </section>
      ) : (
        <section aria-labelledby="index-h">
          <h2 id="index-h" className="sr-only">
            All writing, newest first
          </h2>
          {Object.entries(
            posts.reduce<Record<string, Post[]>>((acc, p) => {
              (acc[p.date.slice(0, 4)] ??= []).push(p);
              return acc;
            }, {}),
          )
            .sort(([a], [b]) => b.localeCompare(a))
            .map(([year, list]) => (
              <div
                key={year}
                className="border-t j-border py-6 sm:grid sm:grid-cols-[6rem_1fr] sm:gap-6"
              >
                <h3 className="text-sm font-semibold j-muted">{year}</h3>
                <ul className="divide-y divide-[var(--j-border)]">
                  {list.map((p) => (
                    <li key={p.url} className="py-3 first:pt-0">
                      <PostLink post={p} className="plain group block">
                        <span className="text-lg font-semibold group-hover:underline">
                          {p.title}
                        </span>
                        <span className="mt-0.5 block text-sm j-muted">{p.excerpt}</span>
                      </PostLink>
                      <div className="mt-1.5">
                        <PostMeta post={p} />
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
        </section>
      )}
    </div>
  );
}
