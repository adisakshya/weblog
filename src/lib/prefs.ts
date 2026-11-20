// Reader preferences. Jekyll handoff: assets/js/prefs.js + the inline PREFS_BOOT snippet in _includes/head/custom.html.
export const THEMES = [
  { id: "original", label: "Daylight" },
  { id: "system", label: "System" },
  { id: "paper", label: "Parchment" },
  { id: "sepia", label: "Amber" },
  { id: "dark-modern", label: "Graphite" },
  { id: "solarized-light", label: "Dune" },
  { id: "solarized-dark", label: "Deep Sea" },
  { id: "space", label: "Cosmos" },
  { id: "spiderman", label: "Spider-Man" },
  { id: "batman", label: "Batman" },
  { id: "superman", label: "Superman" },
  { id: "ironman", label: "Iron Man" },
] as const;
export const SIZES = [
  { id: "standard", label: "Standard" },
  { id: "comfortable", label: "Comfortable" },
  { id: "large", label: "Large" },
] as const;
export const WIDTHS = [
  { id: "focused", label: "Focused" },
  { id: "roomy", label: "Roomy" },
] as const;
// The article font is fixed to the default serif (#79). Older saved payloads may still carry a `font` key (e.g. "sans"): it is
// ignored when reading, never applied, and dropped the next time preferences are saved.
export type Prefs = { theme: string; size: string; width: string };
export const DEFAULT_PREFS: Prefs = {
  theme: "original",
  size: "comfortable",
  width: "roomy",
};
export const PREFS_KEY = "journal-prefs";

// Runs before first paint. Kept dependency-free so it can be pasted into Jekyll as-is.
export const PREFS_BOOT = `(function(){var d={theme:"original",size:"comfortable",width:"roomy"},p=d;try{p=Object.assign({},d,JSON.parse(localStorage.getItem("${PREFS_KEY}")||"{}"))}catch(e){}var h=document.documentElement,t=p.theme;if(t==="system"){t=matchMedia("(prefers-color-scheme: dark)").matches?"dark-modern":"original"}h.setAttribute("data-theme",t);h.setAttribute("data-theme-choice",p.theme);h.setAttribute("data-size",p.size);h.setAttribute("data-width",p.width)})();`;

const CHOICES = { theme: THEMES, size: SIZES, width: WIDTHS } as const;

/** Whatever was stored (older or partial values, other keys, junk) becomes a complete, valid Prefs: each field keeps its
 *  stored value only when it is a known choice, otherwise the default. The stored shape itself is unchanged. */
export function normalizePrefs(raw: unknown): Prefs {
  const src =
    raw && typeof raw === "object" && !Array.isArray(raw) ? (raw as Record<string, unknown>) : {};
  const pick = (key: keyof Prefs): string => {
    const v = src[key];
    return typeof v === "string" && CHOICES[key].some((c) => c.id === v) ? v : DEFAULT_PREFS[key];
  };
  return { theme: pick("theme"), size: pick("size"), width: pick("width") };
}

export function readPrefs(): Prefs {
  try {
    return normalizePrefs(JSON.parse(localStorage.getItem(PREFS_KEY) || "{}"));
  } catch {
    return DEFAULT_PREFS;
  }
}

export function resolveTheme(choice: string) {
  if (choice !== "system") return choice;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark-modern" : "original";
}

/** Puts the choices on <html> (the CSS reads data-theme / data-size / data-width). Does not touch storage. */
export function applyPrefsToDocument(p: Prefs) {
  const h = document.documentElement;
  h.setAttribute("data-theme", resolveTheme(p.theme));
  h.setAttribute("data-theme-choice", p.theme);
  h.removeAttribute("data-font"); // retired attribute: the article font is not a preference any more
  h.setAttribute("data-size", p.size);
  h.setAttribute("data-width", p.width);
}

/** Applies prefs; returns false when storage is unavailable (choice still applies for this page view). */
export function applyPrefs(p: Prefs): boolean {
  applyPrefsToDocument(p);
  try {
    localStorage.setItem(PREFS_KEY, JSON.stringify(p));
    return true;
  } catch {
    return false;
  }
}
