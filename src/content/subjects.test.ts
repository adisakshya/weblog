import { describe, it, expect } from "vitest";
import { subjects, formatShortDate, formatDate, posts } from "./content";

describe("subjects", () => {
  it("summarises populated subjects with distinct counts and newest UTC date", () => {
    // structural, so adding an article never needs a test edit: the original subjects exist, and every group's
    // count is its distinct posts and its newest date is the newest of them (UTC)
    const labels = subjects.map((g) => g.label);
    expect(labels).toContain("Systems");
    expect(labels).toContain("Developer tools");
    expect(labels).toContain("Programming");
    for (const g of subjects) {
      expect(g.posts.length).toBeGreaterThan(0);
      expect(new Set(g.posts.map((p) => p.url)).size).toBe(g.posts.length);
      const newest = Math.max(...g.posts.map((p) => new Date(p.date).getTime()));
      expect(formatShortDate(g.newest!)).toBe(formatShortDate(new Date(newest).toISOString()));
    }
  });
  it("places every post in at least one subject (#94)", () => {
    // a new article whose tags match no subject would be missing from the Subjects view
    const covered = new Set(subjects.flatMap((g) => g.posts.map((p) => p.url)));
    expect(posts.filter((p) => !covered.has(p.url)).map((p) => p.url)).toEqual([]);
  });
  it("formats publication dates in UTC to match the permalink date", () => {
    for (const p of posts) {
      const [, y, m, d] = p.url.match(/\/(\d{4})\/(\d{2})\/(\d{2})\//)!;
      expect(formatDate(p.date)).toBe(
        new Date(Date.UTC(+y!, +m! - 1, +d!)).toLocaleDateString("en-GB", {
          day: "numeric",
          month: "long",
          year: "numeric",
          timeZone: "UTC",
        }),
      );
    }
  });
});
