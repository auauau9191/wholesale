import { Outlet, createFileRoute } from "@tanstack/react-router";
import { AuthGateError, requireSignedIn } from "@/components/auth/AuthGate";
import { AdminLangProvider } from "@/lib/adminI18n";

export const Route = createFileRoute("/_authed")({
  ssr: false,
  beforeLoad: requireSignedIn,
  errorComponent: AuthGateError,
  component: () => (
    <AdminLangProvider>
      <Outlet />
    </AdminLangProvider>
  ),
});