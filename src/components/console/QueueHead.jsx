import { Link } from "@tanstack/react-router";
import { downloadCsv } from "@/lib/csv";
import { paidWithLabel, statusChip } from "@/lib/requestLabels";
import { useAdminT } from "@/lib/adminI18n";

function exportRows(rows, hub) {
  downloadCsv(
    `sample-requests-${hub.toLowerCase()}.csv`,
    ["Request", "Hub", "Member", "ABN", "Product", "Unit ID", "Paid with", "Status", "Checks", "Requested", "Due out", "Decision due"],
    rows.map((row) => [
      row.request_no, row.hub_code, row.member, row.abn_masked, row.product_name, row.unit_id, paidWithLabel(row),
      statusChip(row).label, [...row.flags, ...row.fraud_flags].join("; "), String(row.requested_at).slice(0, 10), row.due_out, row.decision_due ?? "",
    ])
  );
}

/** h1, today's finding for the chosen hub, and the two page actions. */
export default function QueueHead({ queue, hub, rows, updatedAt }) {
  const { t } = useAdminT();
  const { awaiting, late } = queue?.counts ?? {};
  const time = updatedAt ? new Date(updatedAt).toLocaleTimeString("en-AU", { hour: "2-digit", minute: "2-digit", hour12: false }) : null;

  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div className="min-w-0">
        <h1 className="text-title font-medium tracking-[-0.01em]">{t("page.queue.title")}</h1>
        {queue ? (
          <p className="tabular mt-2 max-w-[660px] text-body text-app-meta">
            {t(hub === "ALL" ? "page.queue.findingSendAll" : "page.queue.findingSendHub", {
              count: awaiting,
              hub: t(`hub.short.${hub}`),
            })}
            ;{" "}
            {late ? (
              <span className="text-alert">
                {t(late === 1 ? "page.queue.findingLateOne" : "page.queue.findingLateMany", {
                  count: late,
                  days: queue.promise_days,
                })}
              </span>
            ) : (
              <>{t("page.queue.findingOk", { days: queue.promise_days })}</>
            )}
          </p>
        ) : (
          <div className="mt-3 h-[14px] w-[300px] max-w-full rounded-full bg-rule" />
        )}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {time ? (
          <span className="tabular text-label text-app-meta">{t("page.queue.updated", { time })}</span>
        ) : null}
        <button
          type="button"
          disabled={!rows.length}
          onClick={() => exportRows(rows, hub)}
          className="min-h-[36px] rounded-control border border-control bg-sheet px-3 text-body transition-transform duration-150 hover:border-app-ink active:scale-[0.97] disabled:opacity-40"
        >
          {t("common.exportCsv")}
        </button>
        <Link
          to="/admin/dispatch-labels"
          search={{ hub }}
          target="_blank"
          className="tabular inline-flex min-h-[36px] items-center rounded-control bg-app-ink px-3 text-body font-medium text-sheet transition-transform duration-150 active:scale-[0.97]"
        >
          {t("page.queue.printLabels", { count: awaiting ?? "" })}
        </Link>
      </div>
    </div>
  );
}