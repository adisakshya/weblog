import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { shareImageMeta } from "@/content/site";
import { formatDate } from "@/content/content";
import { drafts } from "@/content/drafts";

export const Route = createFileRoute("/_site/drafts/")({
  head: () => ({
    meta: [
      { title: "Drafts — Adisakshya Chauhan" },
      { name: "description", content: "Unpublished posts, for review before they go live." },
      { name: "robots", content: "noindex,nofollow" },
      ...shareImageMeta(),
    ],
  }),
  component: DraftsPage,
});

function DraftsPage() {
  const [tag, setTag] = useState<string | null>(null);
  const tags = [...new Set(drafts.flatMap((d) => d.tags))].sort();
  const shown = drafts.filter((d) => !tag || d.tags.includes(tag));
  return (
    <div className="mx-auto max-w-3xl px-4 pt-8 sm:px-6">
      <p className="j-draft-bar" role="note">
        <strong>Private preview</strong>
        <span>Unlisted and not indexed. Anyone with this link can read it.</span>
      </p>
      <h1 className="mt-6 text-3xl font-bold">Drafts</h1>
      <p className="mt-1 j-muted">
        {drafts.length} {drafts.length === 1 ? "post" : "posts"} not published yet. Open one to see
        it as readers will.
      </p>
      {drafts.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Filter by tag">
          {[null, ...tags].map((t) => (
            <button
              key={t ?? "all"}
              type="button"
              className="j-chip"
              aria-pressed={tag === t}
              onClick={() => setTag(t)}
            >
              {t ?? "All"}
            </button>
          ))}
        </div>
      )}
      {drafts.length === 0 ? (
        <div className="mt-8 rounded-xl border border-dashed j-border p-8 text-center j-muted">
          <p className="font-semibold">No drafts yet</p>
          <p className="mt-1 text-sm">
            Add a Markdown file to <code>_drafts/</code> and push. It appears here after the next
            deploy.
          </p>
        </div>
      ) : (
        <ul className="mt-6 divide-y divide-[var(--j-border)] border-t j-border">
          {shown.map((d) => (
            <li key={d.slug} className="py-5">
              <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm j-muted">
                <span className="j-draft-chip">Draft</span>
                <time dateTime={d.date}>{formatDate(d.date)}</time>
                <span>{d.readingTime} min read</span>
                <span>
                  {d.missing.length === 0 ? "Ready to publish" : `Missing: ${d.missing.join(", ")}`}
                </span>
              </p>
              <Link
                to="/drafts/$slug"
                params={{ slug: d.slug }}
                className="mt-1 block text-xl font-semibold"
              >
                {d.title}
              </Link>
              <p className="mt-1 j-muted">{d.excerpt}</p>
              {d.tags.length > 0 && (
                <p className="mt-2 flex flex-wrap gap-2">
                  {d.tags.map((t) => (
                    <span key={t} className="j-chip">
                      #{t}
                    </span>
                  ))}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
      <p className="mt-8 rounded-xl j-panel p-4 text-sm j-muted">
        Publish a draft with <code>git mv _drafts/&lt;file&gt;.md _posts/&lt;file&gt;.md</code>.
        Files in <code>_drafts/</code> are also visible in the public repository, so keep secrets
        out of drafts. Name a file with a leading <code>_</code> to keep it out of the build.
      </p>
    </div>
  );
}
