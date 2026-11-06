import { Link } from "@tanstack/react-router";
import OrderStatusChip from "@/components/orders/OrderStatusChip";
import { formatAudWhole, formatDate, formatQty } from "@/lib/format";

/** One row per order: what, how many, total and where it stands. */
export default function OrderList({ orders }) {
  return (
    <ul className="rounded-card border border-edge bg-sheet">
      {orders.map((order) => (
        <li key={order.id} className="border-b border-rule last:border-b-0">
          <Link
            to="/orders/$orderNo"
            params={{ orderNo: order.order_no }}
            className="flex min-h-[64px] items-center justify-between gap-4 px-4 py-3 transition-colors hover:bg-rule"
          >
            <div className="min-w-0">
              <p className="truncate text-body text-app-ink">
                {order.product_name}
                {order.colour ? ` · ${order.colour}` : ""}
              </p>
              <p className="tabular text-label text-app-meta">
                {order.order_no} · {formatQty(order.quantity)} units · {formatDate(order.created_date)}
              </p>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-1">
              <p className="tabular text-body">{formatAudWhole(order.total_aud)}</p>
              <OrderStatusChip status={order.status} />
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}