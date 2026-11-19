import { describe, it, expect } from "vitest";
import { search } from "./search";
import { searchIndex, posts, series } from "./content";

describe("content", () => {
  it("keeps exact original article URLs, including the historical api-ateway spelling", () => {
    const urls = posts.map((p) => p.url);
    for (const original of [
      "/weblog/2021/07/30/extension-pack-for-vscode-and-code-server.html",
      "/weblog/2022/02/01/introduction-to-api-gateway.html",
      "/weblog/2022/07/16/setting-up-an-api-ateway-for-your-microservices.html",
    ])
      expect(urls).toContain(original);
  });
  it("orders API Gateway 101 as Introduction then Setup", () => {
    expect(series[0]!.posts.slice(0, 2).map((p) => p.slug)).toEqual([
      "introduction-to-api-gateway",
      "setting-up-an-api-ateway-for-your-microservices",
    ]);
  });
  it("renders the Setup article's Contribution section once", () => {
    const p = posts.find((p) => p.slug.startsWith("setting-up"))!;
    expect(p.headings.filter((h) => h.text === "Contribution")).toHaveLength(1);
  });
});

describe("search", () => {
  it("matches body text case-insensitively", () => {
    expect(search(searchIndex, "KONGA").some((h) => h.doc.url.includes("setting-up"))).toBe(true);
  });
  it("requires all words in multiword queries", () => {
    expect(search(searchIndex, "travis kong")).toHaveLength(0);
  });
  it("finds the series page", () => {
    expect(search(searchIndex, "api gateway 101")[0]!.doc.kind).toBe("Series");
  });
  it("returns nothing for a nonsense query", () => {
    expect(search(searchIndex, "zzqxw")).toHaveLength(0);
  });
});
