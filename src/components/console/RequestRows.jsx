import RequestAction from "@/components/console/RequestAction";
import { formatDate } from "@/lib/format";
import { dueText, statusChip, statusKey } from "@/lib/requestLabels";
import { useAdminT } from "@/lib/adminI18n";

/** Phone: two-line rows. Member on top; unit ID and due date under it. */
export default function RequestRows({ rows }) {
  const { t } = useAdminT();
  return (
    <ul>
      {rows.map((row) => {
        const date = dueText(row);
        const late = row.days_late || row.days_overdue;
        return (
          <li
            key={row.id}
            className={`flex items-center justify-between gap-3 border-t border-rule px-4 py-3 ${row.status === "on_hold" ? "bg-pill-amber/50" : ""}`}
          >
            <div className="min-w-0">
              <p className="truncate text-body font-medium">{row.member}</p>
              <p className="tabular text-label text-app-meta">
                {row.unit_id}
                {" · "}
                {late ? (
                  <span className="text-alert">
                    {row.days_late
                      ? t("common.daysLate", { count: row.days_late })
                      : t("request.status.overdue")}
                  </span>
                ) : date ? (
                  t("common.due", { date: formatDate(date) })
                ) : (
                  t(statusKey(row)) || statusChip(row).label
                )}
              </p>
            </div>
            <div className="shrink-0">
              <RequestAction row={row} />
            </div>
          </li>
        );
      })}
    </ul>
  );
}