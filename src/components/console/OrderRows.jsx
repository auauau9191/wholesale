import { Link } from "@tanstack/react-router";
import { statusKey } from "@/lib/orderStatus";
import { actionKey } from "@/lib/orderActionLabels";
import { formatAudWhole, formatQty } from "@/lib/format";
import { useAdminT } from "@/lib/adminI18n";

/** Phone and tablet: two-line rows. Order on top; member, units and status under it. */
export default function OrderRows({ rows }) {
  const { t } = useAdminT();
  return (
    <ul>
      {rows.map((row) => (
        <li key={row.id} className="border-t border-rule">
          <Link
            to="/admin/orders/$orderNo"
            params={{ orderNo: row.order_no }}
            className="flex min-h-[64px] items-center justify-between gap-3 px-4 py-3"
          >
            <div className="min-w-0">
              <p className="truncate text-body font-medium">{row.product_name}</p>
              <p className="tabular truncate text-label text-app-meta">
                {row.order_no} · {row.member} · {formatQty(row.quantity)} units
              </p>
              <p className="tabular mt-0.5 text-label text-app-meta">
                {t(statusKey(row.status))}
                {row.next ? ` · ${t(actionKey(row.next))}` : ""}
              </p>
            </div>
            <p className="tabular shrink-0 text-body">{formatAudWhole(row.total_aud)}</p>
          </Link>
        </li>
      ))}
    </ul>
  );
}