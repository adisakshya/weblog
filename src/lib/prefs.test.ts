import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  THEMES,
  DEFAULT_PREFS,
  PREFS_BOOT,
  PREFS_KEY,
  applyPrefs,
  applyPrefsToDocument,
  normalizePrefs,
  readPrefs,
  resolveTheme,
} from "./prefs";

describe("reader preference compatibility", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });
  for (const theme of ["spiderman", "batman", "superman", "ironman"]) {
    it(`persists ${theme} through reading and the pre-paint boot`, () => {
      expect(THEMES.some((t) => t.id === theme)).toBe(true);
      expect(applyPrefs({ ...DEFAULT_PREFS, theme })).toBe(true);
      expect(readPrefs().theme).toBe(theme);
      document.documentElement.setAttribute("data-theme", "original");
      new Function(PREFS_BOOT)();
      expect(document.documentElement.getAttribute("data-theme")).toBe(theme);
    });
  }
  it("retains the eight existing choices and typography defaults", () => {
    expect(THEMES.map((t) => t.id)).toEqual([
      "original",
      "system",
      "paper",
      "sepia",
      "dark-modern",
      "solarized-light",
      "solarized-dark",
      "space",
      "spiderman",
      "batman",
      "superman",
      "ironman",
    ]);
    expect(readPrefs()).toEqual({ theme: "original", size: "comfortable", width: "roomy" });
  });
  it("keeps System following the device instead of replacing its saved choice", () => {
    vi.spyOn(window, "matchMedia").mockImplementation(
      (query) => ({ matches: true, media: query }) as MediaQueryList,
    );
    applyPrefs({ ...DEFAULT_PREFS, theme: "system" });
    expect(readPrefs().theme).toBe("system");
    expect(resolveTheme("system")).toBe("dark-modern");
    vi.spyOn(window, "matchMedia").mockImplementation(
      (query) => ({ matches: false, media: query }) as MediaQueryList,
    );
    expect(resolveTheme("system")).toBe("original");
  });
});

describe("stored preference compatibility and fallbacks", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });
  it("completes partial or older stored values with the defaults", () => {
    localStorage.setItem(PREFS_KEY, JSON.stringify({ font: "sans" }));
    expect(readPrefs()).toEqual(DEFAULT_PREFS);
    localStorage.setItem(PREFS_KEY, JSON.stringify({ theme: "batman", size: "large" }));
    expect(readPrefs()).toEqual({ ...DEFAULT_PREFS, theme: "batman", size: "large" });
  });
  it("keeps every valid combination exactly as stored", () => {
    for (const size of ["standard", "comfortable", "large"])
      for (const width of ["focused", "roomy"]) {
        const p = { theme: "paper", size, width };
        localStorage.setItem(PREFS_KEY, JSON.stringify(p));
        expect(readPrefs()).toEqual(p);
      }
  });
  it("replaces unknown values and ignores unknown keys, junk and non-objects", () => {
    expect(
      normalizePrefs({ font: "comic", size: "huge", width: 3, theme: null, extra: 1 }),
    ).toEqual(DEFAULT_PREFS);
    for (const junk of [null, undefined, 5, "sans", [], [{ font: "sans" }]])
      expect(normalizePrefs(junk)).toEqual(DEFAULT_PREFS);
    localStorage.setItem(PREFS_KEY, "{not json");
    expect(readPrefs()).toEqual(DEFAULT_PREFS);
  });
  it("still applies the choice, and reports it, when storage refuses writes", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    expect(applyPrefs({ ...DEFAULT_PREFS, size: "large" })).toBe(false);
    expect(document.documentElement.getAttribute("data-size")).toBe("large");
  });
  it("falls back to the defaults when storage cannot even be read", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    expect(readPrefs()).toEqual(DEFAULT_PREFS);
  });
  it("applying on load puts the choices on the document without writing storage", () => {
    const set = vi.spyOn(Storage.prototype, "setItem");
    applyPrefsToDocument({ theme: "paper", size: "standard", width: "focused" });
    expect(set).not.toHaveBeenCalled();
    const h = document.documentElement;
    expect([h.dataset["theme"], h.dataset["size"], h.dataset["width"]]).toEqual([
      "paper",
      "standard",
      "focused",
    ]);
  });
  it("a saved Sans selection from an older version is ignored everywhere and dropped on the next save (#79)", () => {
    localStorage.setItem(
      PREFS_KEY,
      JSON.stringify({ theme: "batman", font: "sans", size: "large", width: "focused" }),
    );
    expect(readPrefs()).toEqual({ theme: "batman", size: "large", width: "focused" });
    // the pre-paint boot applies the same three choices and never a font
    document.documentElement.setAttribute("data-font", "sans");
    new Function(PREFS_BOOT)();
    const h = document.documentElement;
    expect([h.dataset["theme"], h.dataset["size"], h.dataset["width"]]).toEqual([
      "batman",
      "large",
      "focused",
    ]);
    // reading and applying clears a stale attribute; the next save no longer stores a font
    applyPrefsToDocument(readPrefs());
    expect(h.hasAttribute("data-font")).toBe(false);
    applyPrefs({ ...readPrefs(), size: "standard" });
    expect(JSON.parse(localStorage.getItem(PREFS_KEY) as string)).toEqual({
      theme: "batman",
      size: "standard",
      width: "focused",
    });
  });
});
