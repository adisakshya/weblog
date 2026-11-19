import { describe, expect, it } from "vitest";
import { posts, series, tags, tagPages, pages, typographic, resolveLiquid } from "./content";

describe("kramdown-compatible typography", () => {
  it("turns straight quotes, dashes and ellipses into the typographic forms Jekyll published", () => {
    expect(typographic("We'll see")).toBe("We’ll see");
    expect(typographic('say "hi" now')).toBe("say “hi” now");
    expect(typographic("'quoted' text")).toBe("‘quoted’ text");
    expect(typographic("a -- b --- c...")).toBe("a – b — c…");
  });
});

describe("Liquid variables in Markdown", () => {
  it("resolves {{site.baseurl}} like Jekyll did, with or without spaces", () => {
    expect(resolveLiquid("[x]({{site.baseurl}}/series/a/)")).toBe("[x](/weblog/series/a/)");
    expect(resolveLiquid("{{ site.baseurl }}/a")).toBe("/weblog/a");
  });
});

describe("authoritative content", () => {
  it("keeps the three original posts at their historical UTC permalinks (new articles may be added)", () => {
    const urls = posts.map((p) => p.url);
    for (const original of [
      "/weblog/2021/07/30/extension-pack-for-vscode-and-code-server.html",
      "/weblog/2022/02/01/introduction-to-api-gateway.html",
      "/weblog/2022/07/16/setting-up-an-api-ateway-for-your-microservices.html",
    ])
      expect(urls).toContain(original);
    expect(new Set(urls).size).toBe(urls.length);
  });
  it("has every original tag page, including tags without posts, and a page for every tag in use", () => {
    const original = [
      "api-gateway",
      "kong",
      "microservices",
      "docker",
      "vscode",
      "code-server",
      "github",
      "ci-cd",
      "travis",
    ];
    expect(tagPages.length).toBeGreaterThanOrEqual(9);
    for (const t of original) expect(tags).toContain(t);
    // a tag used by any article is listed even without its own _pages/tags file
    for (const p of posts) for (const t of p.tags) expect(tags).toContain(t);
  });
  it("has both series; blogging-101 is empty but still exists", () => {
    const by = Object.fromEntries(series.map((s) => [s.slug, s.posts.length]));
    expect(by["api-gateway-101"]).toBeGreaterThanOrEqual(2);
    expect(by["blogging-101"]).toBeGreaterThanOrEqual(0);
    expect(series.slice(0, 2).map((s) => s.slug)).toEqual(["api-gateway-101", "blogging-101"]);
    expect(series[0]!.posts.slice(0, 2).map((p) => p.slug)).toEqual([
      "introduction-to-api-gateway",
      "setting-up-an-api-ateway-for-your-microservices",
    ]);
  });
  it("keeps About, Contact and Terms", () => {
    expect(Object.keys(pages).sort()).toEqual(["about", "contact", "terms"]);
  });
  it("renders resolved links, typography and trailing-newline code in article HTML", () => {
    const setup = posts.find((p) => p.slug.startsWith("setting-up"))!;
    expect(setup.html).toContain('href="/weblog/series/api-gateway-101/"');
    expect(setup.html).not.toContain("{{");
    expect(setup.html).toContain("We’ll be spinning up");
    expect(setup.html).toMatch(/docker ps -a\n<\/code>/);
  });
  it("renders the authored Contribution heading exactly once", () => {
    const setup = posts.find((p) => p.slug.startsWith("setting-up"))!;
    expect(setup.html.match(/<h2 id="contribution"/g)).toHaveLength(1);
  });
});
