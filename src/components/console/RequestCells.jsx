import { formatDate } from "@/lib/format";
import { checksOf, dueText, statusChip, statusKey } from "@/lib/requestLabels";
import { useAdminT } from "@/lib/adminI18n";

export function DueCell({ row }) {
  const { t } = useAdminT();
  const date = dueText(row);
  const late = row.days_late || row.days_overdue;
  return (
    <div className="tabular">
      <p className={late ? "text-alert" : ""}>{date ? formatDate(date) : "—"}</p>
      {row.days_late ? <p className="text-label text-alert">{t("common.daysLate", { count: row.days_late })}</p> : null}
      {row.days_overdue ? <p className="text-label text-alert">{t("common.daysOverdue", { count: row.days_overdue })}</p> : null}
    </div>
  );
}

export function StatusCell({ row }) {
  const { t } = useAdminT();
  const chip = statusChip(row);
  const checks = checksOf(row);
  const key = statusKey(row);
  return (
    <div>
      <span className={`inline-flex whitespace-nowrap rounded-full px-2 py-0.5 text-label ${chip.tone}`}>
        {key ? t(key) : chip.label}
      </span>
      {checks.length ? <p className="mt-1 max-w-[180px] text-label text-app-meta">{checks.join(" · ")}</p> : null}
    </div>
  );
}