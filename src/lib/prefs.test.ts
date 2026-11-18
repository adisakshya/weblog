import { beforeEach, describe, expect, it, vi } from "vitest";
import { THEMES, DEFAULT_PREFS, PREFS_BOOT, applyPrefs, readPrefs, resolveTheme } from "./prefs";

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
    expect(readPrefs()).toEqual({
      theme: "original",
      font: "serif",
      size: "comfortable",
      width: "roomy",
    });
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
