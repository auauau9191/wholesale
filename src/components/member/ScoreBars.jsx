const ROWS = [
  ["score_capability", "Production capability"],
  ["score_quality", "Quality system"],
  ["score_communication", "Communication"],
  ["score_compliance", "Compliance documents"],
  ["score_export", "Export experience"],
];

/** Five bars, each out of 20. */
export default function ScoreBars({ supplier }) {
  return (
    <div className="space-y-3">
      {ROWS.map(([field, label]) => {
        const value = Number(supplier?.[field]) || 0;
        return (
          <div key={field}>
            <div className="flex items-baseline justify-between gap-4">
              <span className="text-body text-app-soft">{label}</span>
              <span className="tabular text-label text-app-meta">{value}/20</span>
            </div>
            <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-rule">
              <div
                className="h-full rounded-full bg-data"
                style={{ width: `${Math.min(value, 20) * 5}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}