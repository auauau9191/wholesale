import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import PageHead from "@/components/shell/PageHead";
import DataBlock from "@/components/shell/DataBlock";
import OrderList from "@/components/orders/OrderList";
import { fetchMyOrders } from "@/services/orderService";

export const Route = createFileRoute("/_authed/_app/orders")({
  head: () => ({ meta: [{ title: "Orders · Wholesale System" }] }),
  component: OrdersPage,
});

function finding(orders) {
  if (!orders?.length) return "Bulk orders, locked to the sample you approved.";
  const due = orders.filter((order) => ["deposit_pending", "balance_pending"].includes(order.status)).length;
  if (due) return `${due} ${due === 1 ? "order is" : "orders are"} waiting on a payment from you.`;
  return `${orders.length} ${orders.length === 1 ? "order" : "orders"}, none waiting on you.`;
}

function OrdersPage() {
  const { data: orders, isLoading, error } = useQuery({ queryKey: ["my-orders"], queryFn: fetchMyOrders });

  return (
    <div className="space-y-6">
      <PageHead title="Orders" note={finding(orders)} />
      {isLoading ? <DataBlock state="loading" /> : null}
      {error ? <DataBlock state="error" note={error.message} /> : null}
      {orders?.length ? <OrderList orders={orders} /> : null}
      {orders && !orders.length ? (
        <DataBlock
          title="No orders yet."
          note="An order starts from a sample you approved."
          action={
            <Link to="/samples" className="inline-flex min-h-[44px] items-center rounded-control bg-app-ink px-4 text-body font-medium text-sheet">
              Go to samples
            </Link>
          }
        />
      ) : null}
    </div>
  );
}