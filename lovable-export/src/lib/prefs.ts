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
export const FONTS = [
  { id: "serif", label: "Serif" },
  { id: "sans", label: "Sans-serif" },
] as const;

export type Prefs = { theme: string; font: string; size: string; width: string };
export const DEFAULT_PREFS: Prefs = { theme: "original", font: "serif", size: "comfortable", width: "roomy" };
export const PREFS_KEY = "journal-prefs";

// Runs before first paint. Kept dependency-free so it can be pasted into Jekyll as-is.
export const PREFS_BOOT = `(function(){var d={theme:"original",font:"serif",size:"comfortable",width:"roomy"},p=d;try{p=Object.assign({},d,JSON.parse(localStorage.getItem("${PREFS_KEY}")||"{}"))}catch(e){}var h=document.documentElement,t=p.theme;if(t==="system"){t=matchMedia("(prefers-color-scheme: dark)").matches?"dark-modern":"original"}h.setAttribute("data-theme",t);h.setAttribute("data-theme-choice",p.theme);h.setAttribute("data-font",p.font);h.setAttribute("data-size",p.size);h.setAttribute("data-width",p.width)})();`;

export function readPrefs(): Prefs {
  try {
    return { ...DEFAULT_PREFS, ...JSON.parse(localStorage.getItem(PREFS_KEY) || "{}") };
  } catch {
    return DEFAULT_PREFS;
  }
}

export function resolveTheme(choice: string) {
  if (choice !== "system") return choice;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark-modern" : "original";
}

/** Applies prefs; returns false when storage is unavailable (choice still applies for this page view). */
export function applyPrefs(p: Prefs): boolean {
  const h = document.documentElement;
  h.setAttribute("data-theme", resolveTheme(p.theme));
  h.setAttribute("data-theme-choice", p.theme);
  h.setAttribute("data-font", p.font);
  h.setAttribute("data-size", p.size);
  h.setAttribute("data-width", p.width);
  try {
    localStorage.setItem(PREFS_KEY, JSON.stringify(p));
    return true;
  } catch {
    return false;
  }
}
