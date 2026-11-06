import { createFileRoute } from "@tanstack/react-router";
import MemberPage from "@/components/shell/PageBlocks";

export const Route = createFileRoute("/_authed/_app/account")({
  head: () => ({ meta: [{ title: "Account · Wholesale System" }] }),
  component: AccountPage,
});

function AccountPage() {
  return (
    <MemberPage
      title="Account"
      note="Business details, plan and sample credits."
      emptyTitle="Your account details appear here."
      emptyNote="We set up your profile when your membership is reviewed."
    />
  );
}