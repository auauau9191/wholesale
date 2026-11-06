import { createFileRoute } from "@tanstack/react-router";
import MemberShell from "@/components/shell/MemberShell";

export const Route = createFileRoute("/_authed/_app")({
  component: MemberArea,
});

function MemberArea() {
  const { user } = Route.useRouteContext();
  return <MemberShell user={user} />;
}