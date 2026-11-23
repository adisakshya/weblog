// The three original posts have hand-made cover artwork (Cover.tsx). Any other post shows its own teaser image.
const ARTWORK = new Set([
  "introduction-to-api-gateway",
  "setting-up-an-api-ateway-for-your-microservices",
  "extension-pack-for-vscode-and-code-server",
]);
export const hasArtwork = (slug: string) => ARTWORK.has(slug);
