import { describe, expect, it, vi } from "vitest";
import { SHARE_IMAGE, SITE_ORIGIN, absoluteUrl, shareImageMeta } from "./site";

describe("site helper", () => {
  it("builds absolute URLs from one origin", () => {
    expect(SITE_ORIGIN).toBe("https://adisakshya.github.io");
    expect(absoluteUrl("/weblog/feed.xml")).toBe("https://adisakshya.github.io/weblog/feed.xml");
    expect(SHARE_IMAGE.url).toBe("https://adisakshya.github.io/weblog/og-image.png");
  });
  it("the default share image meta is one og:image and one twitter:image, absolute, with size and alt", () => {
    const m = shareImageMeta();
    const get = (k: "property" | "name", v: string) =>
      m.filter((e) => (e as Record<string, string>)[k] === v).map((e) => e.content);
    expect(get("property", "og:image")).toEqual([SHARE_IMAGE.url]);
    expect(get("name", "twitter:image")).toEqual([SHARE_IMAGE.url]);
    expect(get("property", "og:image:width")).toEqual(["1200"]);
    expect(get("property", "og:image:height")).toEqual(["630"]);
    expect(get("property", "og:image:alt")).toEqual(["Adisakshya Chauhan"]);
  });
});

describe("post route head: own image wins, the default is the fallback", () => {
  const head = async (teaser: string | undefined) => {
    vi.resetModules();
    vi.doMock("@/content/content", async (orig) => ({
      ...((await orig()) as object),
      findPost: () => ({
        url: "/weblog/2030/01/01/x.html",
        title: "X",
        excerpt: "e",
        date: "2030-01-01",
        teaser,
        tags: [],
        html: "<p>x</p>",
      }),
    }));
    const mod = await import("@/routes/_site.$year.$month.$day.$file");
    const opts = (
      mod.Route as unknown as {
        options: { head: (a: unknown) => { meta: Record<string, string>[] } };
      }
    ).options;
    return opts.head({ loaderData: { url: "/weblog/2030/01/01/x.html" } }).meta;
  };
  const images = (meta: Record<string, string>[]) =>
    meta
      .filter((m) => m["property"] === "og:image" || m["name"] === "twitter:image")
      .map((m) => m["content"]);
  it("a post with its own https image keeps exactly that image", async () => {
    expect(images(await head("https://example.com/own.jpg"))).toEqual([
      "https://example.com/own.jpg",
      "https://example.com/own.jpg",
    ]);
  });
  it("a post without one gets the default share image, once", async () => {
    expect(images(await head(undefined))).toEqual([SHARE_IMAGE.url, SHARE_IMAGE.url]);
  });
  it("a relative or non-https teaser is not used as a share image", async () => {
    expect(images(await head("/weblog/assets/t.png"))).toEqual([SHARE_IMAGE.url, SHARE_IMAGE.url]);
  });
});
