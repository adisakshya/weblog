import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

// The site is a GitHub Pages project site served under /weblog/; vite `base` and the router basepath must match.
export const getRouter = () =>
  createRouter({
    routeTree,
    basepath: "/weblog",
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
  });

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
}
