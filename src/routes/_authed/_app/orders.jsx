import { createFileRoute } from "@tanstack/react-router";
import MemberPage from "@/components/shell/PageBlocks";

export const Route = createFileRoute("/_authed/_app/orders")({
  head: () => ({ meta: [{ title: "Orders · Wholesale System" }] }),
  component: OrdersPage,
});

function OrdersPage() {
  return (
    <MemberPage
      title="Orders"
      note="Bulk orders, locked to the sample you approved."
      emptyTitle="No orders yet."
      emptyNote="An order starts from a sample you approved."
    />
  );
}