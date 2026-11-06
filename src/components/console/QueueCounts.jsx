import CountUp from "@/components/motion/CountUp";
import { QUEUE_FILTERS } from "@/lib/requestLabels";
import { useAdminT } from "@/lib/adminI18n";

/** Plain label + number cards. The selected one filters the list below. */
export default function QueueCounts({ counts, value, onChange }) {
  const { t } = useAdminT();
  return (
    <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 lg:flex-wrap lg:overflow-visible">
      {QUEUE_FILTERS.map((filter) => {
        const active = value === filter.key;
        const amber = filter.amber && counts[filter.key] > 0;
        return (
          <button
            key={filter.key}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(filter.key)}
            className={[
              "flex min-h-[44px] shrink-0 items-center gap-2 rounded-control border px-3 text-body transition-colors lg:shrink",
              active
                ? "border-data bg-pill-green text-pill-green-ink"
                : "border-control bg-sheet hover:border-app-ink",
            ].join(" ")}
          >
            <span className="whitespace-nowrap">
              {t(`request.filter.${filter.key}.label`)}
            </span>
            <CountUp
              value={counts[filter.key]}
              format={(n) => String(Math.round(n))}
              className={`tabular font-medium ${amber && !active ? "text-alert" : ""}`}
            />
          </button>
        );
      })}
    </div>
  );
}