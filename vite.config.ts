import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// Fully static build for GitHub Pages project site: https://adisakshya.github.io/weblog/
export default defineConfig({
  base: "/weblog/",
  resolve: { tsconfigPaths: true },
  plugins: [
    tanstackStart({
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
