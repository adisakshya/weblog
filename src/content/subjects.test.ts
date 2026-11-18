import { describe, it, expect } from "vitest";
import { subjects, formatShortDate, formatDate, posts } from "./content";

describe("subjects", () => {
  it("summarises populated subjects with distinct counts and newest UTC date", () => {
    expect(
      subjects.map((g) => `${g.label} · ${g.posts.length} · ${formatShortDate(g.newest!)}`),
    ).toEqual(["Systems · 2 · 16 Jul 2022", "Developer tools · 1 · 30 Jul 2021"]);
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
