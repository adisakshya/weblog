// Content loader. Reads the authoritative Markdown in this repository (_posts/, _pages/) at build time.
// Prose is never edited here. Comment records in _data/comments/ are intentionally not loaded or rendered.
import { Marked, type Tokens } from "marked";
import YAML from "yaml";
import hljs from "highlight.js/lib/common";

const postFiles = import.meta.glob("/_posts/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;
const pageFiles = import.meta.glob("/_pages/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;
const seriesFiles = import.meta.glob("/_pages/series/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

export const BASE = "/weblog";

export type Heading = { id: string; text: string; depth: number };
export type Post = {
  slug: string; // file slug, e.g. introduction-to-api-gateway
  url: string; // exact Jekyll permalink: /weblog/YYYY/MM/DD/slug.html (UTC date)
  title: string;
  excerpt: string;
  date: string; // ISO
  tags: string[];
  series?: string | undefined;
  teaser?: string | undefined;
  html: string;
  text: string;
  headings: Heading[];
  readingTime: number;
};
export type Page = {
  key: string;
  title: string;
  excerpt?: string | undefined;
  html: string;
  text: string;
  headings: Heading[];
};
export type Series = { slug: string; title: string; excerpt: string; posts: Post[] };

type FrontMatter = {
  title?: string;
  excerpt?: string;
  date?: unknown;
  tags?: string[];
  series?: string | undefined;
  header?: { teaser?: string };
  [key: string]: unknown;
};

function splitFrontMatter(raw: string): { data: FrontMatter; body: string } {
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!m) return { data: {}, body: raw };
  return { data: (YAML.parse(m[1]!) ?? {}) as FrontMatter, body: m[2]! };
}

// kramdown auto_ids: lowercase, drop chars other than letters/digits/space/hyphen, spaces -> hyphens.
export function kramdownId(text: string) {
  return (
    text
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, "")
      .trim()
      .replace(/ /g, "-")
      .replace(/^[^a-z]+/, "") || "section"
  );
}

function escapeHtml(s: string) {
  return s.replace(
    /[&<>"']/g,
    (c) =>
      (
        ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }) as Record<
          string,
          string
        >
      )[c] ?? c,
  );
}

function render(md: string) {
  const headings: Heading[] = [];
  const used = new Map<string, number>();
  const marked = new Marked({
    gfm: true,
    renderer: {
      heading({ tokens, depth, text }: Tokens.Heading) {
        const inner = this.parser.parseInline(tokens);
        const plain = text.replace(/<[^>]+>/g, "").replace(/[*_`]/g, "");
        let id = kramdownId(plain);
        const n = used.get(id) ?? 0;
        used.set(id, n + 1);
        if (n) id = `${id}-${n}`;
        if (depth >= 2 && depth <= 3) headings.push({ id, text: plain, depth });
        return `<h${depth} id="${id}"><a class="heading-anchor" href="#${id}" aria-label="Link to section: ${escapeHtml(plain)}">#</a>${inner}</h${depth}>`;
      },
      code({ text, lang }: Tokens.Code) {
        const language = lang && hljs.getLanguage(lang) ? lang : undefined;
        const out = language ? hljs.highlight(text, { language }).value : escapeHtml(text);
        return `<div class="code-block" data-lang="${language ?? "text"}"><pre tabindex="0"><code class="hljs">${out}</code></pre></div>`;
      },
      table(token: Tokens.Table) {
        const head = token.header
          .map((c) => `<th>${this.parser.parseInline(c.tokens)}</th>`)
          .join("");
        const rows = token.rows
          .map(
            (r) =>
              `<tr>${r.map((c) => `<td>${this.parser.parseInline(c.tokens)}</td>`).join("")}</tr>`,
          )
          .join("");
        return `<div class="table-wrap" tabindex="0"><table><thead><tr>${head}</tr></thead><tbody>${rows}</tbody></table></div>`;
      },
      image({ href, title, text }: Tokens.Image) {
        return `<img src="${href}" alt="${escapeHtml(text)}"${title ? ` title="${escapeHtml(title)}"` : ""} loading="lazy" decoding="async" class="zoomable" />`;
      },
      link({ href, title, tokens }: Tokens.Link) {
        const inner = this.parser.parseInline(tokens);
        const external =
          /^https?:\/\//.test(href) && !href.startsWith("https://adisakshya.github.io/weblog");
        return `<a href="${href}"${title ? ` title="${escapeHtml(title)}"` : ""}${external ? ' rel="noopener noreferrer" target="_blank"' : ""}>${inner}${external ? '<span class="sr-only"> (opens in a new tab)</span>' : ""}</a>`;
      },
    },
  });
  const html = marked.parse(md) as string;
  const text = html
    .replace(/<pre[\s\S]*?<\/pre>/g, (m) => " " + m.replace(/<[^>]+>/g, " ") + " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&[a-z#0-9]+;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return { html, text, headings };
}

function utcDateParts(d: Date) {
  const p = (n: number) => String(n).padStart(2, "0");
  return [d.getUTCFullYear(), p(d.getUTCMonth() + 1), p(d.getUTCDate())] as const;
}

// Jekyll front matter dates like "2022-07-17 00:30:00 +0530"
function parseJekyllDate(v: unknown): Date {
  if (v instanceof Date) return v;
  const s = String(v)
    .trim()
    .replace(/^(\d{4}-\d\d-\d\d) (\d\d:\d\d:\d\d) ([+-]\d\d)(\d\d)$/, "$1T$2$3:$4");
  return new Date(s);
}

export const posts: Post[] = Object.entries(postFiles)
  .map(([path, raw]) => {
    const file = (path.split("/").pop() ?? "").replace(/\.md$/, "");
    const slug = file.replace(/^\d{4}-\d\d-\d\d-/, "");
    const { data, body } = splitFrontMatter(raw);
    const date = parseJekyllDate(data.date ?? file.slice(0, 10));
    const [y, m, d] = utcDateParts(date); // GitHub Pages builds in UTC
    const r = render(body);
    const words = r.text.split(/\s+/).filter(Boolean).length;
    return {
      slug,
      url: `${BASE}/${y}/${m}/${d}/${slug}.html`,
      title: String(data.title),
      excerpt: String(data.excerpt ?? ""),
      date: date.toISOString(),
      tags: (data.tags ?? []) as string[],
      series: data.series,
      teaser: data.header?.teaser,
      readingTime: Math.max(1, Math.ceil(words / 200)), // Minimal Mistakes words_per_minute: 200
      ...r,
    } satisfies Post;
  })
  .sort((a, b) => b.date.localeCompare(a.date));

export const pages: Record<string, Page> = Object.fromEntries(
  Object.entries(pageFiles).map(([path, raw]) => {
    const key = (path.split("/").pop() ?? "").replace(/\.md$/, "");
    const { data, body } = splitFrontMatter(raw);
    return [key, { key, title: String(data.title), excerpt: data.excerpt, ...render(body) }];
  }),
);

const seriesMeta = splitFrontMatter(seriesFiles["/_pages/series/api-gateway-101.md"] ?? "").data;
export const series: Series[] = [
  {
    slug: "api-gateway-101",
    title: String(seriesMeta.title ?? "API Gateway 101"),
    excerpt: String(seriesMeta.excerpt ?? ""),
    posts: posts
      .filter((p) => p.series === "api-gateway-101")
      .sort((a, b) => a.date.localeCompare(b.date)), // learning order: oldest first
  },
];

export const tags: string[] = [...new Set(posts.flatMap((p) => p.tags))].sort();

// Proposed editorial groupings (not yet approved; tag URLs unchanged).
export const groupings = [
  {
    label: "Systems",
    description: "API gateways, microservices and the containers behind them.",
    tags: ["api-gateway", "kong", "microservices", "docker"],
  },
  {
    label: "Developer tools",
    description: "Editors, remote coding setups and the workflows around them.",
    tags: ["vscode", "code-server", "github", "ci-cd", "travis"],
  },
]
  .map((g) => ({ ...g, posts: posts.filter((p) => p.tags.some((t) => g.tags.includes(t))) }))
  .filter((g) => g.posts.length);

export const findPost = (url: string) => posts.find((p) => p.url === url);
export const seriesFor = (p: Post) => series.find((s) => s.slug === p.series);

export const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
/** Short UTC date, e.g. "16 Jul 2022" (matches permalink dates). */
export const formatShortDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });

// Search index built from the same content source (Jekyll equivalent: lunr-store.js).
export type SearchDoc = {
  url: string;
  title: string;
  kind: "Article" | "Series" | "Page" | "Topic";
  summary: string;
  tags: string[];
  body: string;
};
export const searchIndex: SearchDoc[] = [
  ...posts.map((p) => ({
    url: p.url,
    title: p.title,
    kind: "Article" as const,
    summary: p.excerpt,
    tags: p.tags,
    body: p.text,
  })),
  ...series.map((s) => ({
    url: `${BASE}/series/${s.slug}/`,
    title: s.title,
    kind: "Series" as const,
    summary: s.excerpt,
    tags: [],
    body: s.posts.map((p) => p.title).join(" "),
  })),
  ...["contact", "terms"].map((k) => ({
    url: `${BASE}/${k}/`,
    title: pages[k]!.title,
    kind: "Page" as const,
    summary: pages[k]!.excerpt ?? "",
    tags: [],
    body: pages[k]!.text,
  })),
  ...tags.map((t) => ({
    url: `${BASE}/tags/${t}/`,
    title: `#${t}`,
    kind: "Topic" as const,
    summary: `Writing tagged ${t}`,
    tags: [t],
    body: "",
  })),
];

/** Subjects: populated groupings with distinct posts (newest first) and newest publication date, computed from Markdown. */
export const subjects = groupings
  .map((g) => {
    const list = posts
      .filter((p) => p.tags.some((t) => g.tags.includes(t)))
      .sort((a, b) => b.date.localeCompare(a.date));
    return { ...g, posts: list, newest: list[0]?.date };
  })
  .filter((g) => g.posts.length > 0);
