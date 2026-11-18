import { createFileRoute, redirect } from "@tanstack/react-router";

// Preview-only: production serves the weblog under /weblog/ on adisakshya.github.io.
export const Route = createFileRoute("/")({
  beforeLoad: () => {
    throw redirect({ to: "/weblog", replace: true });
  },
});
