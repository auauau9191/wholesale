import { Outlet, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_site")({
  component: PublicLayout,
});

/** Public pages bring their own header and footer, so the landing can run full width. */
function PublicLayout() {
  return (
    <div className="min-h-screen bg-ground text-ink">
      <Outlet />
    </div>
  );
}