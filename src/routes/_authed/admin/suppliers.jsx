import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import DataBlock from "@/components/shell/DataBlock";
import PageHead from "@/components/shell/PageHead";
import { getSupplierBoard } from "@/services/adminService";
import { STAGES, stageKey } from "@/lib/supplier-rules";
import { useAdminT } from "@/lib/adminI18n";

export const Route = createFileRoute("/_authed/admin/suppliers")({
  head: () => ({ meta: [{ title: "Suppliers · Wholesale System" }] }),
  component: SuppliersPage,
});

const HEAD = "px-3 py-2 text-left text-label font-normal text-app-meta first:pl-5 last:pr-5";
const CELL = "px-3 py-3 align-top first:pl-5 last:pr-5";

function SuppliersPage() {
  const { t } = useAdminT();
  const [stage, setStage] = useState("");
  const board = useQuery({ queryKey: ["supplier-board"], queryFn: getSupplierBoard });
  const rows = (board.data?.rows ?? []).filter((row) => !stage || row.pipeline_stage === stage);
  const live = (board.data?.rows ?? []).filter((row) => row.pipeline_stage === "live").length;

  return (
    <div className="space-y-6">
      <PageHead
        title={t("page.suppliers.title")}
        note={
          board.data
            ? t("page.suppliers.note", { total: board.data.rows.length, live })
            : t("page.suppliers.notePlain")
        }
      />
      {board.isLoading ? <DataBlock state="loading" /> : null}
      {board.error ? <DataBlock state="error" note={board.error.message} /> : null}
      {board.data ? (
        <>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setStage("")}
              aria-pressed={stage === ""}
              className={["min-h-[36px] rounded-control border px-3 text-body", stage === "" ? "border-data bg-pill-green text-pill-green-ink" : "border-control"].join(" ")}
            >
              {t("page.suppliers.all", { count: board.data.rows.length })}
            </button>
            {[...STAGES, "rejected"].map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setStage(value)}
                aria-pressed={stage === value}
                className={["min-h-[36px] rounded-control border px-3 text-body", stage === value ? "border-data bg-pill-green text-pill-green-ink" : "border-control"].join(" ")}
              >
                {t(stageKey(value))}
              </button>
            ))}
            <Link to="/admin/supplier-pipeline" className="ml-auto inline-flex min-h-[36px] items-center rounded-control px-3 text-body text-app-meta hover:text-app-ink">
              {t("page.suppliers.openPipeline")}
            </Link>
          </div>

          <section className="rounded-card border border-edge bg-sheet">
            {rows.length ? (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] text-body">
                  <thead>
                    <tr>
                      <th className={HEAD}>{t("page.suppliers.headSupplier")}</th>
                      <th className={HEAD}>{t("page.suppliers.headPlace")}</th>
                      <th className={HEAD}>{t("page.suppliers.headStage")}</th>
                      <th className={`${HEAD} text-right`}>{t("page.suppliers.headScore")}</th>
                      <th className={HEAD}>{t("page.suppliers.headAgreement")}</th>
                      <th className={`${HEAD} text-right`}>{t("page.suppliers.headProducts")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row) => (
                      <tr key={row.id} className="border-t border-rule">
                        <td className={CELL}>
                          <Link
                            to="/admin/suppliers/$supplierCode"
                            params={{ supplierCode: row.supplier_code }}
                            className="font-medium hover:underline"
                          >
                            {row.headline}
                          </Link>
                          <p className="tabular text-label text-app-meta">{row.supplier_code}</p>
                        </td>
                        <td className={CELL}>{row.place || "—"}</td>
                        <td className={CELL}>{t(stageKey(row.pipeline_stage))}</td>
                        <td className={`${CELL} tabular text-right`}>{row.verification_score}/100</td>
                        <td className={CELL}>{row.agreement_status}</td>
                        <td className={`${CELL} tabular text-right`}>{row.product_count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="px-5 py-6 text-body text-app-meta">{t("page.suppliers.empty")}</p>
            )}
          </section>
        </>
      ) : null}
    </div>
  );
}