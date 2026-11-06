import { Outlet, createFileRoute, redirect } from "@tanstack/react-router";
import ConsoleShell from "@/components/shell/ConsoleShell";

export const Route = createFileRoute("/_authed/admin")({
  beforeLoad: ({ context }) => {
    const user = context.user;
    const isStaff = user?.role === "admin" || Boolean(user?.hub_code);
    if (user && !isStaff) throw redirect({ to: "/browse" });
  },
  component: ConsoleLayout,
});

function ConsoleLayout() {
  const { user } = Route.useRouteContext();
  return <ConsoleShell user={user} />;
}