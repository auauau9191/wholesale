import { Outlet, createFileRoute } from "@tanstack/react-router";
import MemberShell from "@/components/shell/MemberShell";
import MembershipPending from "@/components/public/MembershipPending";
import DataBlock from "@/components/shell/DataBlock";
import useMemberProfile from "@/hooks/useMemberProfile";
import useAppSettings from "@/hooks/useAppSettings";
import { isMembershipActive } from "@/lib/membership";
import { planPriceAud } from "@/lib/plans";

export const Route = createFileRoute("/_authed/_app")({
  component: MemberArea,
});

/** Every member page needs an active membership that is paid up to today. */
function MemberArea() {
  const { user } = Route.useRouteContext();
  const { profile, loading } = useMemberProfile(user?.email);
  const { data: settings } = useAppSettings();

  let content;
  if (loading) {
    content = <DataBlock state="loading" />;
  } else if (!isMembershipActive(profile)) {
    content = (
      <MembershipPending
        variant="app"
        profile={profile}
        price={planPriceAud(settings, profile?.plan)}
      />
    );
  } else {
    content = <Outlet />;
  }

  return <MemberShell profile={profile}>{content}</MemberShell>;
}