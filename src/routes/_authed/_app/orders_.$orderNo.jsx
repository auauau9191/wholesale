import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft } from "lucide-react";
import DataBlock from "@/components/shell/DataBlock";
import OrderStatusChip from "@/components/orders/OrderStatusChip";
import OrderSummary from "@/components/orders/OrderSummary";
import OrderLines from "@/components/orders/OrderLines";
import OrderTimeline from "@/components/orders/OrderTimeline";
import PaymentInstructions from "@/components/orders/PaymentInstructions";
import CreditsUnlocked from "@/components/orders/CreditsUnlocked";
import useAppSettings from "@/hooks/useAppSettings";
import { statusOf } from "@/lib/orderStatus";
import { fetchMyOrder } from "@/services/orderService";

export const Route = createFileRoute("/_authed/_app/orders_/$orderNo")({
  head: ({ params }) => ({ meta: [{ title: `Order ${params.orderNo} · Wholesale System` }] }),
  component: OrderDetailPage,
});

function OrderDetailPage() {
  const { orderNo } = Route.useParams();
  const { data: settings } = useAppSettings();
  const { data: order, isLoading, error } = useQuery({
    queryKey: ["my-orders", orderNo],
    queryFn: () => fetchMyOrder(orderNo),
  });

  return (
    <div className="space-y-5">
      <div className="flex items-start gap-2">
        <Link to="/orders" aria-label="Back to orders" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-control hover:bg-pill-grey">
          <ChevronLeft className="h-5 w-5" aria-hidden="true" />
        </Link>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="tabular text-title font-medium tracking-[-0.01em]">Order {orderNo}</h1>
            {order ? <OrderStatusChip status={order.status} /> : null}
          </div>
          {order ? (
            <p className="mt-1 text-body text-app-meta">
              {order.product_name}
              {order.colour ? ` · ${order.colour}` : ""}. {statusOf(order.status).label}.
            </p>
          ) : null}
        </div>
      </div>

      {isLoading ? <DataBlock state="loading" /> : null}
      {error ? <DataBlock state="error" note={error.message} /> : null}
      {!isLoading && !error && !order ? <DataBlock title="We can't find that order." note="It may belong to another account." /> : null}

      {order ? (
        <div className="grid gap-5 lg:grid-cols-2">
          <div className="space-y-5">
            {order.credits_granted ? <CreditsUnlocked credits={settings?.order_sample_credits ?? 2} /> : null}
            {order.status === "deposit_pending" ? <PaymentInstructions order={order} /> : null}
            <OrderSummary order={order} />
            <section className="rounded-card border border-edge bg-sheet p-5">
              <OrderLines quote={order} commissionRate={settings?.supplier_commission_rate} showSplit />
            </section>
          </div>
          <OrderTimeline entries={order.timeline} />
        </div>
      ) : null}
    </div>
  );
}