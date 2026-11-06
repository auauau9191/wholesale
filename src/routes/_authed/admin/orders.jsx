import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import DataBlock from "@/components/shell/DataBlock";
import PageHead from "@/components/shell/PageHead";
import { getAdminOrders } from "@/services/adminService";
import { statusOf } from "@/lib/orderStatus";
import { ORDER_ACTION_LABEL } from "@/lib/orderActionLabels";
import { formatAudWhole, formatQty } from "@/lib/format";

const HEAD = "px-3 py-2 text-left text-label font-normal text-app-meta first:pl-5 last:pr-5";
const CELL = "px-3 py-3 align-top first:pl-5 last:pr-5";

export const Route = createFileRoute("/_authed/admin/orders")({
  head: () => ({ meta: [{ title: "Orders and inspections · Wholesale System" }] }),
  component: OrdersPage,
});

function OrdersPage() {
  const [status, setStatus] = useState("");
  const { data, isLoading, error } = useQuery({ queryKey: ["admin-orders"], queryFn: getAdminOrders });
  const rows = (data ?? []).filter((row) => !status || row.status === status);
  const statuses = [...new Set((data ?? []).map((row) => row.status))];
  const needs = (data ?? []).filter((row) => row.next).length;

  return (
    <div className="space-y-6">
      <PageHead
        title="Orders and inspections"
        note={
          data
            ? `${data.length} orders, ${needs} with a step waiting on us. Each step is taken in order.`
            : "Orders in production, in inspection and on the water."
        }
      />
      {isLoading ? <DataBlock state="loading" /> : null}
      {error ? <DataBlock state="error" note={error.message} /> : null}
      {data ? (
        <>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setStatus("")}
              aria-pressed={status === ""}
              className={["min-h-[36px] rounded-control border px-3 text-body", status === "" ? "border-data bg-pill-green text-pill-green-ink" : "border-control"].join(" ")}
            >
              All {data.length}
            </button>
            {statuses.map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setStatus(value)}
                aria-pressed={status === value}
                className={["min-h-[36px] rounded-control border px-3 text-body", status === value ? "border-data bg-pill-green text-pill-green-ink" : "border-control"].join(" ")}
              >
                {statusOf(value).label} {data.filter((row) => row.status === value).length}
              </button>
            ))}
          </div>

          <section className="rounded-card border border-edge bg-sheet">
            {rows.length ? (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[820px] text-body">
                  <thead>
                    <tr>
                      <th className={HEAD}>Order</th>
                      <th className={HEAD}>Member</th>
                      <th className={HEAD}>Product</th>
                      <th className={`${HEAD} text-right`}>Units</th>
                      <th className={`${HEAD} text-right`}>Total</th>
                      <th className={HEAD}>Status</th>
                      <th className={HEAD}>Next step</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row) => (
                      <tr key={row.id} className="border-t border-rule">
                        <td className={CELL}>
                          <Link to="/admin/orders/$orderNo" params={{ orderNo: row.order_no }} className="tabular font-medium hover:underline">
                            {row.order_no}
                          </Link>
                        </td>
                        <td className={CELL}>{row.member}</td>
                        <td className={CELL}>
                          {row.product_name}
                          <p className="tabular text-label text-app-meta">{row.supplier_code}</p>
                        </td>
                        <td className={`${CELL} tabular text-right`}>{formatQty(row.quantity)}</td>
                        <td className={`${CELL} tabular text-right`}>{formatAudWhole(row.total_aud)}</td>
                        <td className={CELL}>
                          <span className={`inline-flex whitespace-nowrap rounded-full px-2 py-0.5 text-label ${statusOf(row.status).tone}`}>
                            {statusOf(row.status).label}
                          </span>
                        </td>
                        <td className={CELL}>{row.next ? ORDER_ACTION_LABEL[row.next] : <span className="text-app-meta">Nothing</span>}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="px-5 py-6 text-body text-app-meta">No orders with that status.</p>
            )}
          </section>
        </>
      ) : null}
    </div>
  );
}