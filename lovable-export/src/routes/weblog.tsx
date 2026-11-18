import { createFileRoute, Outlet } from "@tanstack/react-router";
import { Shell } from "@/components/journal/Shell";

export const Route = createFileRoute("/weblog")({
  component: WeblogLayout,
});

function WeblogLayout() {
  return (
    <Shell>
      <Outlet />
    </Shell>
  );
}
