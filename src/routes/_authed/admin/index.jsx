import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import DataBlock from "@/components/shell/DataBlock";
import PageHead from "@/components/shell/PageHead";
import { useHubScope } from "@/components/shell/HubScope";
import CountUp from "@/components/motion/CountUp";
import { getOverview } from "@/lib/console-pages-fns";
import { formatAudWhole } from "@/lib/format";
import { useAdminT } from "@/lib/adminI18n";

const TILES = [
  ["pending_members", "/admin/members"],
  ["active_members", "/admin/members"],
  ["to_send", "/admin/sample-requests"],
  ["samples_out", "/admin/sample-requests"],
  ["decisions_overdue", "/admin/sample-requests"],
  ["qc_hold", "/admin/sample-inventory"],
  ["in_stock", "/admin/sample-inventory"],
  ["containers_this_week", "/admin/containers"],
  ["orders_in_production", "/admin/orders"],
  ["live_suppliers", "/admin/suppliers"],
];
const ALERT = new Set(["decisions_overdue", "pending_members"]);

export const Route = createFileRoute("/_authed/admin/")({
  head: () => ({ meta: [{ title: "Overview · Wholesale System" }] }),
  component: OverviewPage,
});

function OverviewPage() {
  const { t } = useAdminT();
  const { hub } = useHubScope();
  const { data, isLoading, error } = useQuery({ queryKey: ["overview", hub], queryFn: () => getOverview({ data: { hub } }) });
  const c = data?.counts;

  return (
    <div className="space-y-6">
      <PageHead
        title={t("page.overview.title")}
        note={c ? t("page.overview.noteCount", { send: c.to_send, pending: c.pending_members, overdue: c.decisions_overdue }) : t("page.overview.note")}
      />
      {isLoading ? <DataBlock state="loading" /> : null}
      {error ? <DataBlock state="error" note={error.message} /> : null}
      {c ? (
        <>
          <section className="grid grid-cols-2 gap-px overflow-hidden rounded-card border border-edge bg-rule md:grid-cols-3 xl:grid-cols-5">
            {TILES.map(([key, to]) => (
              <Link key={key} to={to} className="block bg-sheet p-4 transition-colors hover:bg-[#f7f8f4]">
                <p className="text-label text-app-meta">{t(`page.overview.tile.${key}`)}</p>
                <p className={`tabular mt-2 text-[28px] font-medium leading-none ${ALERT.has(key) && c[key] ? "text-alert" : ""}`}>
                  <CountUp value={c[key]} />
                </p>
              </Link>
            ))}
          </section>
          {data.money ? (
            <section className="rounded-card border border-edge bg-sheet p-5">
              <p className="text-label text-app-meta">{t("page.overview.commission")}</p>
              <p className="tabular mt-2 text-[28px] font-medium leading-none">{formatAudWhole(data.money.commission_month)}</p>
              <p className="mt-2 text-label text-app-meta">{t("page.overview.commissionNote", { count: data.money.commission_records })}</p>
            </section>
          ) : null}
        </>
      ) : null}
    </div>
  );
}
