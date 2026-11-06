import { Outlet, createFileRoute } from "@tanstack/react-router";
import PublicHeader from "@/components/public/PublicHeader";
import PublicFooter from "@/components/public/PublicFooter";

export const Route = createFileRoute("/_site")({
  component: PublicLayout,
});

function PublicLayout() {
  return (
    <div className="min-h-screen bg-ground text-ink">
      <PublicHeader />
      <Outlet />
      <PublicFooter />
    </div>
  );
}