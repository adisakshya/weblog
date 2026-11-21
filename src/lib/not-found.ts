export const NOT_FOUND_TITLE = "Page not found — Adisakshya Chauhan";

/** Head entries for every not-found state. The words "Page not found" are load-bearing: scripts/postbuild.mjs refuses to build
 *  without them in 404.html, and scripts/live-check.mjs looks for them in the live site's 404 body. */
export const notFoundMeta = [{ title: NOT_FOUND_TITLE }, { name: "robots", content: "noindex" }];
