import { createRouter, rootRouteId } from "@tanstack/react-router";
import { describe, expect, it } from "vitest";
import { routeTree } from "@/routeTree.gen";

// Route matching (paths are relative to the /weblog basepath), without running loaders or rendering.
describe("App routing", () => {
  const router = createRouter({ routeTree, basepath: "/weblog" });
  const idOf = (path: string) => router.matchRoutes(path).at(-1)?.routeId;

  it.each([
    ["/", "/_site/"],
    ["/contact", "/_site/contact"],
    ["/terms", "/_site/terms"],
    ["/tags/kong/", "/_site/tags/$tag"],
    ["/series/api-gateway-101/", "/_site/series/$series"],
    ["/2022/02/01/introduction-to-api-gateway.html", "/_site/$year/$month/$day/$file"],
  ])("matches %s", (path, id) => {
    expect(idOf(path)).toBe(id);
  });

  it("does not match unknown paths (they fall through to the not-found boundary)", () => {
    expect(idOf("/nope/nope")).toBe(rootRouteId);
  });
});
