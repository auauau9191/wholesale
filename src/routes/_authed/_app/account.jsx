import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import PageHead from "@/components/shell/PageHead";
import DataBlock from "@/components/shell/DataBlock";
import AccountSummary from "@/components/account/AccountSummary";
import CreditHistory from "@/components/account/CreditHistory";
import useMemberProfile from "@/hooks/useMemberProfile";
import useAppSettings from "@/hooks/useAppSettings";
import { listMyCredits } from "@/services/memberService";

export const Route = createFileRoute("/_authed/_app/account")({
  head: () => ({ meta: [{ title: "Account · Wholesale System" }] }),
  component: AccountPage,
});

function AccountPage() {
  const { user } = Route.useRouteContext();
  const { profile, loading } = useMemberProfile(user?.email);
  const { data: settings } = useAppSettings();
  const { data: credits = [], isLoading: creditsLoading } = useQuery({
    queryKey: ["credits", user?.email],
    queryFn: () => listMyCredits(user.email, 50),
    enabled: Boolean(user?.email),
  });

  const balance = credits.reduce((total, entry) => total + (Number(entry.change) || 0), 0);

  return (
    <div className="space-y-7">
      <PageHead
        title="Account"
        note="Your plan, the date the price changes and every sample credit on the account."
      />

      {loading ? <DataBlock state="loading" /> : null}

      {!loading && profile ? <AccountSummary profile={profile} settings={settings} /> : null}

      {!loading && !profile ? (
        <DataBlock
          title="No membership on this account yet."
          note="Start the three steps and we take it from there."
        />
      ) : null}

      <CreditHistory credits={credits} balance={balance} loading={creditsLoading} />
    </div>
  );
}