// Generates sitemap.xml and feed.xml (Atom) into dist/client from the SAME content module the app renders from,
// so the feeds can never drift from the published pages. Run from scripts/postbuild.mjs.
import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { createServer } from "vite";

const SITE = "https://adisakshya.github.io";
const BASE = "/weblog";
const esc = (s) =>
  String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
const abs = (path) => `${SITE}${path}`;

export async function generateFeeds(distDir) {
  const vite = await createServer({
    configFile: false,
    root: process.cwd(),
    logLevel: "silent",
    appType: "custom",
    server: { middlewareMode: true, hmr: false, watch: null },
    resolve: { tsconfigPaths: true },
    optimizeDeps: { noDiscovery: true },
  });
  try {
    const content = await vite.ssrLoadModule("/src/content/content.ts");
    const { posts, series, tagPages, pages } = content;

    const pageUrls = [
      { loc: `${BASE}/` },
      ...posts.map((p) => ({ loc: p.url, lastmod: p.date })),
      ...series.map((s) => ({ loc: `${BASE}/series/${s.slug}/` })),
      ...tagPages.map((t) => ({ loc: `${BASE}/tags/${t.tag}/` })),
      ...Object.keys(pages).map((k) => ({ loc: `${BASE}/${k}/` })),
    ];
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${pageUrls
      .map(
        (u) =>
          `  <url><loc>${esc(abs(u.loc))}</loc>${u.lastmod ? `<lastmod>${new Date(u.lastmod).toISOString()}</lastmod>` : ""}</url>`,
      )
      .join("\n")}\n</urlset>\n`;

    const updated = new Date(Math.max(...posts.map((p) => +new Date(p.date)))).toISOString();
    const feed = `<?xml version="1.0" encoding="UTF-8"?>\n<feed xmlns="http://www.w3.org/2005/Atom">\n  <title>The blog of Adisakshya Chauhan</title>\n  <subtitle>A compilation of musings, inspirations, mistakes, and other ramblings.</subtitle>\n  <link rel="self" type="application/atom+xml" href="${abs(`${BASE}/feed.xml`)}"/>\n  <link rel="alternate" type="text/html" href="${abs(`${BASE}/`)}"/>\n  <id>${abs(`${BASE}/`)}</id>\n  <updated>${updated}</updated>\n  <author><name>Adisakshya Chauhan</name><uri>${SITE}/</uri></author>\n${posts
      .map(
        (p) =>
          `  <entry>\n    <title>${esc(p.title)}</title>\n    <link rel="alternate" type="text/html" href="${esc(abs(p.url))}"/>\n    <id>${esc(abs(p.url))}</id>\n    <published>${new Date(p.date).toISOString()}</published>\n    <updated>${new Date(p.date).toISOString()}</updated>\n${p.tags.map((t) => `    <category term="${esc(t)}"/>`).join("\n")}\n    <summary>${esc(p.excerpt)}</summary>\n    <content type="html">${esc(p.html)}</content>\n  </entry>`,
      )
      .join("\n")}\n</feed>\n`;

    await writeFile(resolve(distDir, "sitemap.xml"), sitemap);
    await writeFile(resolve(distDir, "feed.xml"), feed);
    return { urls: pageUrls.length, entries: posts.length };
  } finally {
    await vite.close();
  }
}
