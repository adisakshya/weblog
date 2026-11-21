import { readdirSync } from "node:fs";
import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// Pages that no other page links to (an empty series, a tag without posts, About) are not found by the link crawler,
// so list every taxonomy/page file explicitly. Posts are linked from the home page; check-dist guards completeness.
const slugs = (dir: string) =>
  readdirSync(dir)
    .filter((f) => f.endsWith(".md"))
    .map((f) => f.replace(/\.md$/, ""));
const extraPages = [
  "/weblog/about/",
  ...slugs("_pages/series").map((s) => `/weblog/series/${s}/`),
  ...slugs("_pages/tags").map((t) => `/weblog/tags/${t}/`),
].map((path) => ({ path }));

// Fully static build for GitHub Pages project site: https://adisakshya.github.io/weblog/
export default defineConfig({
  base: "/weblog/",
  resolve: { tsconfigPaths: true },
  // Dev server only (not part of the static build): Codespaces serves the forwarded port under *.app.github.dev and Vite
  // rejects unknown Host headers with a 403 unless they are allowed.
  server: { allowedHosts: [".app.github.dev"] },
  plugins: [
    tanstackStart({
      pages: extraPages,
      prerender: {
        enabled: true,
        crawlLinks: true,
        autoSubfolderIndex: true,
        failOnError: true,
        // A query string cannot change the output file: ?view=index would overwrite the Posts home page in index.html.
        // The Subjects/Index views are client-side state on top of the same HTML document.
        filter: ({ path }) => !path.includes("?"),
      },
    }),
    viteReact(),
    tailwindcss(),
  ],
});
