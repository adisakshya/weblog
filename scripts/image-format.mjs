// Cover images may be JPEG, PNG or WebP (the formats src/content/curated.ts accepts). Shared by the release gates so
// that the accepted formats are defined in one place: file extension -> MIME type, and the real magic bytes.
export const MIME = { jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", webp: "image/webp" };

/** "jpg" | "png" | "webp" | null, from the file's first bytes. */
export function imageKind(bytes) {
  const b = [...bytes.slice(0, 12)];
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return "jpg";
  if (b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) return "png";
  const tag = (from, s) => [...s].every((c, i) => b[from + i] === c.charCodeAt(0));
  if (tag(0, "RIFF") && tag(8, "WEBP")) return "webp";
  return null;
}

/** Whether `bytes` are a real image whose format matches the file extension of `path`. */
export function matchesExtension(path, bytes) {
  const ext = path.split(".").pop().toLowerCase();
  const kind = imageKind(bytes);
  return !!kind && (ext === "jpeg" ? "jpg" : ext) === kind;
}
export const mimeOf = (path) => MIME[path.split(".").pop().toLowerCase()];

/** Every cover URL on a page, matched case-insensitively exactly like src/content/curated.ts validates file names
 *  (so cover.JPG / cover.Png are found, served and checked the same as cover.jpg). Returns a fresh global regex. */
export const coverUrlPattern = () => /\/weblog\/curated\/[\w.-]+\.(?:jpe?g|png|webp)/gi;
