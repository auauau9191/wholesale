import { formatDayMonthYear } from "@/lib/format";

const BAR_MAX = 20;

/** The supplier film card: the dated board, the score, the bars behind it. */
export default function FilmCard({ data }) {
  const { supplier, unit } = data;
  if (!supplier) return null;
  const bars = [
    ["Production capability", supplier.capability],
    ["Quality system", supplier.quality],
    ["Export experience", supplier.exportScore],
  ];
  const chapter = supplier.chapters[1]?.title ?? supplier.chapters[0]?.title ?? "Factory floor";

  return (
    <div className="w-full max-w-[360px] border-2 border-ink bg-ground p-4 text-ink md:p-5">
      <p className="text-body font-medium">Supplier {supplier.code} · {supplier.type}</p>
      <p className="mt-1 text-body text-ink-soft">
        {supplier.city} · {supplier.lines} · {supplier.staff} staff
      </p>

      <div className="relative mt-4 aspect-[16/10] bg-ink">
        <p className="absolute left-3 top-3 bg-paper px-2 py-1 text-label text-ink">
          {supplier.code} · {formatDayMonthYear(supplier.filmed)}
        </p>
        <span className="absolute left-1/2 top-1/2 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-paper">
          <svg viewBox="0 0 10 12" className="ml-[2px] h-3 w-3 text-ink" aria-hidden="true" fill="currentColor">
            <path d="M0 0l10 6-10 6z" />
          </svg>
        </span>
        <div aria-hidden="true" className="absolute inset-x-3 bottom-7 h-[3px] bg-paper/30">
          <div className="h-full w-[14%] bg-paper" />
        </div>
        <p className="absolute inset-x-3 bottom-2 text-center text-label text-paper">
          0:42 / 5:12 · {chapter}
        </p>
      </div>

      <div className="mt-4 space-y-3">
        <div className="flex items-baseline justify-between gap-3">
          <span className="text-body">Verification score</span>
          <span className="text-body font-medium tabular">{supplier.score} / 100</span>
        </div>
        {bars.map(([label, value]) => (
          <div key={label}>
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-body text-ink-soft">{label}</span>
              <span className="text-body tabular">
                {value}/{BAR_MAX}
              </span>
            </div>
            <div aria-hidden="true" className="mt-1 h-[3px] w-full bg-ink/15">
              <div className="h-full bg-ink" style={{ width: `${((value ?? 0) / BAR_MAX) * 100}%` }} />
            </div>
          </div>
        ))}
      </div>

      {unit ? (
        <p className="mt-4 text-label text-ink-soft">
          Board carried at the gate, the line, the QC bench and packing.
        </p>
      ) : null}
    </div>
  );
}