import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import DataBlock from "@/components/shell/DataBlock";
import PageHead from "@/components/shell/PageHead";
import { getAdminOrders } from "@/services/adminService";
import { statusOf, statusKey } from "@/lib/orderStatus";
import { actionKey } from "@/lib/orderActionLabels";
import { formatAudWhole, formatQty } from "@/lib/format";
import { useAdminT } from "@/lib/adminI18n";

const HEAD = "px-3 py-2 text-left text-label font-normal text-app-meta first:pl-5 last:pr-5";
const CELL = "px-3 py-3 align-top first:pl-5 last:pr-5";

export const Route = createFileRoute("/_authed/admin/orders")({
  head: () => ({ meta: [{ title: "Orders and inspections · Wholesale System" }] }),
  component: OrdersPage,
});

function OrdersPage() {
  const { t } = useAdminT();
  const [status, setStatus] = useState("");
  const { data, isLoading, error } = useQuery({ queryKey: ["admin-orders"], queryFn: getAdminOrders });
  const rows = (data ?? []).filter((row) => !status || row.status === status);
  const statuses = [...new Set((data ?? []).map((row) => row.status))];
  const needs = (data ?? []).filter((row) => row.next).length;

  return (
    <div className="space-y-6">
      <PageHead
        title={t("page.orders.title")}
        note={
          data
            ? t("page.orders.note", { total: data.length, needs })
            : t("page.orders.notePlain")
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
              {t("page.orders.all", { count: data.length })}
            </button>
            {statuses.map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setStatus(value)}
                aria-pressed={status === value}
                className={["min-h-[36px] rounded-control border px-3 text-body", status === value ? "border-data bg-pill-green text-pill-green-ink" : "border-control"].join(" ")}
              >
                {t(statusKey(value))} {data.filter((row) => row.status === value).length}
              </button>
            ))}
          </div>

          <section className="rounded-card border border-edge bg-sheet">
            {rows.length ? (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[820px] text-body">
                  <thead>
                    <tr>
                      <th className={HEAD}>{t("page.orders.headOrder")}</th>
                      <th className={HEAD}>{t("page.orders.headMember")}</th>
                      <th className={HEAD}>{t("page.orders.headProduct")}</th>
                      <th className={`${HEAD} text-right`}>{t("page.orders.headUnits")}</th>
                      <th className={`${HEAD} text-right`}>{t("page.orders.headTotal")}</th>
                      <th className={HEAD}>{t("page.orders.headStatus")}</th>
                      <th className={HEAD}>{t("page.orders.headNext")}</th>
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
                            {t(statusKey(row.status))}
                          </span>
                        </td>
                        <td className={CELL}>
                          {row.next ? t(actionKey(row.next)) : <span className="text-app-meta">{t("common.nothing")}</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="px-5 py-6 text-body text-app-meta">{t("page.orders.empty")}</p>
            )}
          </section>
        </>
      ) : null}
    </div>
  );
}