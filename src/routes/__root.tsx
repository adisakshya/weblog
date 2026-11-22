import { Outlet, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import type { ReactNode } from "react";

import appCss from "../styles.css?url";
import { PREFS_BOOT } from "../lib/prefs";
import { Shell } from "@/components/journal/Shell";
import { NotFoundPage } from "@/components/journal/NotFound";
import { NOT_FOUND_TITLE } from "@/lib/not-found";

// An unknown URL: the branded page inside the normal site shell (the same page an unknown article URL shows).
function NotFoundComponent() {
  return (
    <Shell>
      <NotFoundPage />
    </Shell>
  );
}

function ErrorComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong. Try refreshing, or head back home.
        </p>
        <div className="mt-6">
          <a
            href="/weblog/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: ({ matches }) => {
    // any not-found match (an unknown URL, or an unknown article URL) gets the not-found title and is kept out of search indexes
    const notFound = matches.some((m) => m.status === "notFound" || m._notFound);
    return {
      // Replace these placeholders with the app's name and description when first building the app.
      // Each content route, / included, must still set its own head(). Never add og:image or
      // twitter:image here: every page without its own would inherit the root's preview image.
      meta: [
        { charSet: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        { title: notFound ? NOT_FOUND_TITLE : "Adisakshya Chauhan" },
        ...(notFound ? [{ name: "robots", content: "noindex" }] : []),
        {
          name: "description",
          content:
            "A compilation of Adisakshya’s musings 🤔, inspirations 🌟, mistakes 😅, and other ramblings 🧐.",
        },
        { name: "author", content: "Adisakshya Chauhan" },
        { property: "og:site_name", content: "Adisakshya Chauhan" },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:site", content: "@adisakshya" },
      ],
      links: [
        {
          rel: "stylesheet",
          href: appCss,
        },
        // आदि favicon set (docs/brand/assets, shipped unchanged from public/): the SVG where it is supported, the ICO (16/32/48) as the
        // fallback, and the 180px Apple touch icon.
        { rel: "icon", href: `${import.meta.env.BASE_URL}favicon.svg`, type: "image/svg+xml" },
        {
          rel: "icon",
          href: `${import.meta.env.BASE_URL}favicon.ico`,
          type: "image/x-icon",
          sizes: "16x16 32x32 48x48",
        },
        { rel: "apple-touch-icon", href: `${import.meta.env.BASE_URL}apple-touch-icon.png` },
        {
          rel: "alternate",
          type: "application/atom+xml",
          title: "Adisakshya Chauhan",
          href: `${import.meta.env.BASE_URL}feed.xml`,
        },
        // Agustina is self-hosted (src/styles/fonts/agustina.woff, @font-face in journal.css;
        // reuse confirmed by the site owner). It previously loaded from fonts.cdnfonts.com,
        // which silently failed to apply on iPhone Safari and Android Chrome.
        { rel: "preconnect", href: "https://fonts.googleapis.com" },
        { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
        {
          rel: "stylesheet",
          href: "https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;600&family=Source+Serif+4:ital,opsz,wght@0,8..60,400;0,8..60,600;1,8..60,400&display=swap",
        },
      ],
    };
  },
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: PREFS_BOOT }} />
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  return <Outlet />;
}
