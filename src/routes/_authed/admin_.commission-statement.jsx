import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import DataBlock from "@/components/shell/DataBlock";
import SampleTag from "@/components/brand/SampleTag";
import { getCommissionStatement, getPayouts } from "@/services/adminService";
import { formatAud, formatAudWhole, formatDate } from "@/lib/format";
import { useAdminT } from "@/lib/adminI18n";

const monthNow = () => new Date().toISOString().slice(0, 7);
const monthName = (month) => {
  const [year, value] = String(month ?? "").split("-");
  const date = new Date(`${year}-${value}-01T00:00:00Z`);
  return Number.isNaN(date.getTime()) ? month : date.toLocaleDateString("en-AU", { month: "long", year: "numeric", timeZone: "UTC" });
};

export const Route = createFileRoute("/_authed/admin_/commission-statement")({
  validateSearch: (search) => ({
    supplier: search.supplier ? String(search.supplier) : undefined,
    month: search.month ? String(search.month) : undefined,
  }),
  head: () => ({ meta: [{ title: "Commission statement · Wholesale System" }] }),
  component: CommissionStatementPage,
});

function CommissionStatementPage() {
  const { t } = useAdminT();
  const search = Route.useSearch();
  const [supplier, setSupplier] = useState(search.supplier ?? "");
  const [month, setMonth] = useState(search.month ?? monthNow());
  const options = useQuery({ queryKey: ["payouts"], queryFn: getPayouts });
  const { data, isLoading, error } = useQuery({
    queryKey: ["commission-statement", supplier, month],
    queryFn: () => getCommissionStatement({ supplier_code: supplier, month }),
    enabled: Boolean(supplier),
  });

  return (
    <div className="min-h-screen bg-sheet p-6 print:p-0">
      <div className="mb-6 flex flex-wrap items-end gap-3 print:hidden">
        <label className="block">
          <span className="text-label text-app-meta">{t("page.statement.supplier")}</span>
          <select
            value={supplier}
            onChange={(event) => setSupplier(event.target.value)}
            className="mt-1 min-h-[36px] rounded-control border border-control bg-sheet px-2 text-body outline-none focus:border-app-ink"
          >
            <option value="">{t("page.statement.chooseSupplier")}</option>
            {(options.data?.suppliers ?? []).map((item) => (
              <option key={item.code} value={item.code}>{item.label}</option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="text-label text-app-meta">{t("page.statement.month")}</span>
          <input
            type="month"
            value={month}
            onChange={(event) => setMonth(event.target.value)}
            className="tabular mt-1 min-h-[36px] rounded-control border border-control bg-sheet px-2 text-body outline-none focus:border-app-ink"
          />
        </label>
        <button
          type="button"
          onClick={() => window.print()}
          disabled={!data?.rows.length}
          className="min-h-[44px] rounded-control bg-app-ink px-4 text-body font-medium text-sheet disabled:opacity-40"
        >
          {t("common.print")}
        </button>
      </div>

      {!supplier ? (
        <DataBlock
          title={t("page.statement.chooseFirstTitle")}
          note={t("page.statement.chooseFirstNote")}
        />
      ) : null}
      {isLoading ? <DataBlock state="loading" /> : null}
      {error ? <DataBlock state="error" note={error.message} /> : null}

      {data ? (
        <article className="mx-auto max-w-[760px]">
          <header className="flex items-start justify-between gap-4 border-b border-edge pb-4">
            <div className="flex items-center gap-2.5">
              <SampleTag className="h-5 w-auto" />
              <span className="text-body font-medium">Wholesale System</span>
            </div>
            <div className="text-right">
              <p className="text-body font-medium">{t("page.statement.title")}</p>
              <p className="tabular text-label text-app-meta">{monthName(data.month)}</p>
            </div>
          </header>

          <div className="mt-4 flex flex-wrap justify-between gap-3">
            <div>
              <p className="text-label text-app-meta">{t("page.statement.supplier")}</p>
              <p className="text-body font-medium">{data.supplier.headline}</p>
              <p className="tabular text-label text-app-meta">
                {data.supplier.code}
                {data.supplier.legal_name ? ` · ${data.supplier.legal_name}` : ""}
              </p>
            </div>
            <div className="text-right">
              <p className="text-label text-app-meta">{t("page.statement.payoutCurrency")}</p>
              <p className="text-body">{data.supplier.payout_currency ?? "—"}</p>
            </div>
          </div>

          {data.rows.length ? (
            <table className="mt-6 w-full text-body">
              <thead>
                <tr className="text-label text-app-meta">
                  <th className="border-b border-control pb-2 text-left font-normal">{t("page.statement.headOrder")}</th>
                  <th className="border-b border-control pb-2 text-left font-normal">{t("page.statement.headPlaced")}</th>
                  <th className="border-b border-control pb-2 text-right font-normal">{t("page.statement.headGoods")}</th>
                  <th className="border-b border-control pb-2 text-right font-normal">{t("page.statement.headRate")}</th>
                  <th className="border-b border-control pb-2 text-right font-normal">{t("page.statement.headCommission")}</th>
                </tr>
              </thead>
              <tbody>
                {data.rows.map((row) => (
                  <tr key={row.order_no} className="border-b border-rule">
                    <td className="tabular py-2">{row.order_no}</td>
                    <td className="tabular py-2">{formatDate(row.created_date)}</td>
                    <td className="tabular py-2 text-right">{formatAud(row.goods_aud)}</td>
                    <td className="tabular py-2 text-right">{Math.round(row.rate * 1000) / 10}%</td>
                    <td className="tabular py-2 text-right">{formatAud(row.commission_aud)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td className="pt-3 text-body font-medium" colSpan={2}>
                    {t(data.rows.length === 1 ? "page.statement.countOne" : "page.statement.countMany", {
                      count: data.rows.length,
                    })}
                  </td>
                  <td className="tabular pt-3 text-right font-medium">{formatAudWhole(data.total_goods_aud)}</td>
                  <td />
                  <td className="tabular pt-3 text-right font-medium">{formatAudWhole(data.total_commission_aud)}</td>
                </tr>
              </tfoot>
            </table>
          ) : (
            <p className="mt-6 text-body text-app-meta">
              {t("page.statement.empty", { month: monthName(data.month) })}
            </p>
          )}

          <p className="mt-6 text-label text-app-meta">{t("page.statement.footnote")}</p>
        </article>
      ) : null}
    </div>
  );
}