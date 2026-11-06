import { formatQty, formatUsd } from "@/lib/format";
import { unitShort } from "@/lib/orderStatus";

const ROUTE = { via_BNE: "Via our Brisbane hub", via_SYD: "Via our Sydney hub", direct: "Direct to your door" };

/** What the order is locked to, frozen when it was placed. */
export default function OrderSummary({ order }) {
  const rows = [
    ["Product · spec", `${order.product_id}${order.spec_revision ? `-${order.spec_revision}` : ""}`],
    ["Approved unit", `${unitShort(order.approved_unit_id)} · ${order.sample_request_no ?? ""}`],
    ["Quantity", `${formatQty(order.quantity)} units at ${formatUsd(order.unit_fob_usd)}`],
    ["Delivery", ROUTE[order.delivery_route] ?? "Set by our team"],
  ];
  return (
    <section className="rounded-card border border-edge bg-sheet p-5">
      <h2 className="text-lead font-medium">Locked to your approved sample</h2>
      <dl className="mt-3 space-y-2 text-body">
        {rows.map(([label, value]) => (
          <div key={label} className="flex justify-between gap-4">
            <dt className="text-app-soft">{label}</dt>
            <dd className="tabular text-right">{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}