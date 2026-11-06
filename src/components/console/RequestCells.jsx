import { formatDate } from "@/lib/format";
import { checksOf, dueText, statusChip } from "@/lib/requestLabels";

const plural = (n, word) => `${n} ${word}${n === 1 ? "" : "s"}`;

export function DueCell({ row }) {
  const date = dueText(row);
  const late = row.days_late || row.days_overdue;
  return (
    <div className="tabular">
      <p className={late ? "text-alert" : ""}>{date ? formatDate(date) : "—"}</p>
      {row.days_late ? <p className="text-label text-alert">{plural(row.days_late, "day")} late</p> : null}
      {row.days_overdue ? <p className="text-label text-alert">{plural(row.days_overdue, "day")} overdue</p> : null}
    </div>
  );
}

export function StatusCell({ row }) {
  const chip = statusChip(row);
  const checks = checksOf(row);
  return (
    <div>
      <span className={`inline-flex whitespace-nowrap rounded-full px-2 py-0.5 text-label ${chip.tone}`}>{chip.label}</span>
      {checks.length ? <p className="mt-1 max-w-[180px] text-label text-app-meta">{checks.join(" · ")}</p> : null}
    </div>
  );
}