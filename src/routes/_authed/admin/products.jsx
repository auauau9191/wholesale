import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import DataBlock from "@/components/shell/DataBlock";
import PageHead from "@/components/shell/PageHead";
import { getProductList } from "@/services/adminService";
import { formatQty } from "@/lib/format";
import { useAdminT } from "@/lib/adminI18n";

export const Route = createFileRoute("/_authed/admin/products")({
  head: () => ({ meta: [{ title: "Products · Wholesale System" }] }),
  component: ProductsPage,
});

const HEAD = "px-3 py-2 text-left text-label font-normal text-app-meta first:pl-5 last:pr-5";
const CELL = "px-3 py-3 align-top first:pl-5 last:pr-5";
const STATUSES = ["live", "draft", "sample_unavailable", "retired"];

function ProductsPage() {
  const { t } = useAdminT();
  const [status, setStatus] = useState("");
  const { data, isLoading, error } = useQuery({ queryKey: ["product-list"], queryFn: getProductList });
  const rows = (data?.rows ?? []).filter((row) => !status || row.status === status);
  const live = (data?.rows ?? []).filter((row) => row.status === "live").length;

  return (
    <div className="space-y-6">
      <PageHead
        title={t("page.products.title")}
        note={
          data
            ? t("page.products.note", { total: data.rows.length, live })
            : t("page.products.notePlain")
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
              {t("page.products.all", { count: data.rows.length })}
            </button>
            {STATUSES.map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setStatus(value)}
                aria-pressed={status === value}
                className={["min-h-[36px] rounded-control border px-3 text-body", status === value ? "border-data bg-pill-green text-pill-green-ink" : "border-control"].join(" ")}
              >
                {t(`productStatus.${value}`)}
              </button>
            ))}
          </div>

          <section className="rounded-card border border-edge bg-sheet">
            {rows.length ? (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[860px] text-body">
                  <thead>
                    <tr>
                      <th className={HEAD}>{t("page.products.headProduct")}</th>
                      <th className={HEAD}>{t("page.products.headSupplier")}</th>
                      <th className={HEAD}>{t("page.products.headStatus")}</th>
                      <th className={`${HEAD} text-right`}>{t("page.products.headMoq")}</th>
                      <th className={`${HEAD} text-right`}>{t("page.products.headTiers")}</th>
                      <th className={HEAD}>{t("page.products.headRevision")}</th>
                      <th className={`${HEAD} text-right`}>{t("page.products.headShelf")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row) => (
                      <tr key={row.product_id} className="border-t border-rule">
                        <td className={CELL}>
                          <Link
                            to="/admin/products/$productId"
                            params={{ productId: row.product_id }}
                            className="font-medium hover:underline"
                          >
                            {row.name}
                          </Link>
                          <p className="tabular text-label text-app-meta">{row.product_id}</p>
                        </td>
                        <td className={CELL}>
                          {row.supplier}
                          <p className="tabular text-label text-app-meta">{row.category}</p>
                        </td>
                        <td className={CELL}>{t(`productStatus.${row.status}`)}</td>
                        <td className={`${CELL} tabular text-right`}>{formatQty(row.moq)}</td>
                        <td className={`${CELL} tabular text-right`}>{row.tiers}</td>
                        <td className={`${CELL} tabular`}>{row.revision ?? "—"}</td>
                        <td className={`${CELL} tabular text-right ${row.on_shelf ? "" : "text-alert"}`}>{row.on_shelf}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="px-5 py-6 text-body text-app-meta">{t("page.products.empty")}</p>
            )}
          </section>
        </>
      ) : null}
    </div>
  );
}