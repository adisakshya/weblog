import { createFileRoute, Outlet } from "@tanstack/react-router";
import { Shell } from "@/components/journal/Shell";

export const Route = createFileRoute("/_site")({
  component: WeblogLayout,
});

function WeblogLayout() {
  return (
    <Shell>
      <Outlet />
    </Shell>
  );
}
