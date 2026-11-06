import { createFileRoute } from "@tanstack/react-router";
import { ConsolePage } from "@/components/shell/PageBlocks";

export const Route = createFileRoute("/_authed/admin/orders")({
  head: () => ({ meta: [{ title: "Orders and inspections · Wholesale System" }] }),
  component: OrdersPage,
});

function OrdersPage() {
  return (
    <ConsolePage
      title="Orders and inspections"
      note="Orders in production, in inspection and on the water."
      scoped
      emptyTitle="No orders yet."
      emptyNote="An order starts from a sample a member approved, so it carries that unit's revision."
    />
  );
}