import { Link } from "@tanstack/react-router";
import PaymentInstructions from "@/components/orders/PaymentInstructions";

/** Straight after confirming: the order number and how to pay the deposit. */
export default function OrderPlaced({ order }) {
  return (
    <div className="space-y-5">
      <section className="rounded-card border border-data bg-pill-green p-5 text-pill-green-ink">
        <h2 className="tabular text-lead font-medium">Order {order.order_no} placed</h2>
        <p className="mt-1 text-body">
          It's locked to the sample you approved. Pay the deposit and the factory starts production.
        </p>
      </section>
      <PaymentInstructions order={order} />
      <Link
        to="/orders/$orderNo"
        params={{ orderNo: order.order_no }}
        className="inline-flex min-h-[44px] items-center text-body font-medium underline underline-offset-4"
      >
        Follow this order
      </Link>
    </div>
  );
}