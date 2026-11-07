import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import DataBlock from "@/components/shell/DataBlock";
import PageHead from "@/components/shell/PageHead";
import { useHubScope } from "@/components/shell/HubScope";
import ShelfStrip, { SHELF_KEY, ShelfMark } from "@/components/console/ShelfStrip";
import { getInventory } from "@/lib/console-pages-fns";
import { useAdminT } from "@/lib/adminI18n";

const COLS = ["in_transit", "qc_hold", "in_stock", "reserved", "with_member", "retired"];
const HEAD = "px-3 py-2 text-left text-label font-normal text-app-meta first:pl-5 last:pr-5";
const CELL = "px-3 py-3 align-top first:pl-5 last:pr-5";

export const Route = createFileRoute("/_authed/admin/sample-inventory")({
  head: () => ({ meta: [{ title: "Sample inventory · Wholesale System" }] }),
  component: SampleInventoryPage,
});

function SampleInventoryPage() {
  const { t } = useAdminT();
  const { hub } = useHubScope();
  const { data, isLoading, error } = useQuery({ queryKey: ["inventory", hub], queryFn: () => getInventory({ data: { hub } }) });
  const rows = data?.rows ?? [];
  const low = rows.filter((row) => row.low).length;
  const onShelf = rows.reduce((sum, row) => sum + row.counts.in_stock, 0);

  return (
    <div className="space-y-6">
      <PageHead
        title={t("page.inventory.title")}
        note={data ? t("page.inventory.noteCount", { hub: t(`hub.${data.hub}`), onShelf, low }) : t("page.inventory.note")}
      />
      {isLoading ? <DataBlock state="loading" /> : null}
      {error ? <DataBlock state="error" note={error.message} /> : null}
      {data && !rows.length ? <DataBlock title={t("page.inventory.emptyTitle")} note={t("page.inventory.emptyNote")} /> : null}
      {rows.length ? (
        <>
          <ul className="flex flex-wrap gap-x-5 gap-y-2 text-label text-app-meta">
            {SHELF_KEY.map(([kind]) => (
              <li key={kind} className="inline-flex items-center gap-2">
                <ShelfMark kind={kind} /> {t(`page.inventory.key.${kind}`)}
              </li>
            ))}
          </ul>
          <section className="rounded-card border border-edge bg-sheet">
            <div className="hidden overflow-x-auto lg:block">
              <table className="w-full min-w-[920px] text-body">
                <thead>
                  <tr>
                    <th className={HEAD}>{t("page.inventory.headProduct")}</th>
                    {COLS.map((col) => (
                      <th key={col} className={`${HEAD} text-right`}>{t(`page.inventory.col.${col}`)}</th>
                    ))}
                    <th className={HEAD}>{t("page.inventory.headShelf")}</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.product_id} className="border-t border-rule">
                      <td className={CELL}>
                        <p className="font-medium">{row.name}</p>
                        <p className="tabular text-label text-app-meta">
                          {row.product_id}
                          {row.master_hub ? ` · ${t("page.inventory.masterAt", { hub: row.master_hub })}` : ""}
                        </p>
                        {row.low ? (
                          <span className="mt-1 inline-flex h-[22px] items-center rounded-full bg-pill-amber px-2 text-label font-medium text-pill-amber-ink">
                            {t("page.inventory.low", { level: data.level })}
                          </span>
                        ) : null}
                      </td>
                      {COLS.map((col) => (
                        <td key={col} className={`${CELL} tabular text-right ${row.counts[col] ? "" : "text-app-meta"}`}>{row.counts[col]}</td>
                      ))}
                      <td className={CELL}><ShelfStrip marks={row.marks} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <ul className="lg:hidden">
              {rows.map((row) => (
                <li key={row.product_id} className="space-y-2 border-t border-rule px-4 py-3 first:border-t-0">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-body font-medium">{row.name}</p>
                      <p className="tabular truncate text-label text-app-meta">
                        {row.product_id} · {t("page.inventory.col.in_stock")} {row.counts.in_stock} · {t("page.inventory.col.qc_hold")} {row.counts.qc_hold}
                      </p>
                    </div>
                    {row.low ? <span className="shrink-0 rounded-full bg-pill-amber px-2 text-label text-pill-amber-ink">{t("page.inventory.lowShort")}</span> : null}
                  </div>
                  <ShelfStrip marks={row.marks} />
                </li>
              ))}
            </ul>
          </section>
        </>
      ) : null}
    </div>
  );
}
