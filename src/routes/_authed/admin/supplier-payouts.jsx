import { createFileRoute } from "@tanstack/react-router";
import { ConsolePage } from "@/components/shell/PageBlocks";

export const Route = createFileRoute("/_authed/admin/supplier-payouts")({
  head: () => ({ meta: [{ title: "Supplier payouts · Wholesale System" }] }),
  component: PayoutsPage,
});

function PayoutsPage() {
  return (
    <ConsolePage
      title="Supplier payouts"
      note="Deposits and balances, with our commission withheld from the balance."
      emptyTitle="No payouts scheduled."
      emptyNote="A payout appears when an order reaches its deposit or balance stage."
    />
  );
}