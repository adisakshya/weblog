// The site's public origin and the default social share image. One definition, used by the page heads, the feed and the sitemap
// (scripts/generate-feeds.mjs loads this module), so an absolute URL can never be built two different ways.
export const SITE_ORIGIN = "https://adisakshya.github.io";
export const BASE_PATH = "/weblog";

/** An absolute URL for a site path such as "/weblog/about/". Social crawlers ignore relative og:image URLs. */
export const absoluteUrl = (path: string) => `${SITE_ORIGIN}${path}`;

/** The approved default share image (docs/brand/assets/og-image.png, shipped from public/): 1200x630, no tagline. */
export const SHARE_IMAGE = {
  url: absoluteUrl(`${BASE_PATH}/og-image.png`),
  width: 1200,
  height: 630,
  alt: "Adisakshya Chauhan",
} as const;

/**
 * The default share image as head meta entries. Add it PER ROUTE (never in the root route: every page without its own image would
 * inherit it, and posts with their own image must keep theirs).
 */
export function shareImageMeta() {
  return [
    { property: "og:image", content: SHARE_IMAGE.url },
    { property: "og:image:width", content: String(SHARE_IMAGE.width) },
    { property: "og:image:height", content: String(SHARE_IMAGE.height) },
    { property: "og:image:alt", content: SHARE_IMAGE.alt },
    { name: "twitter:image", content: SHARE_IMAGE.url },
    { name: "twitter:image:alt", content: SHARE_IMAGE.alt },
  ];
}
