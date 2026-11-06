import CountUp from "@/components/motion/CountUp";
import { QUEUE_FILTERS } from "@/lib/requestLabels";

/** Plain label + number cards. The selected one filters the list below. */
export default function QueueCounts({ counts, value, onChange }) {
  return (
    <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 lg:grid lg:grid-cols-6 lg:overflow-visible">
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
              "min-h-[44px] shrink-0 rounded-card border px-3 py-2.5 text-left transition-colors lg:shrink",
              active ? "border-data bg-pill-green" : "border-edge bg-sheet hover:border-control",
            ].join(" ")}
          >
            <span className="block whitespace-nowrap text-body text-app-soft lg:whitespace-normal">{filter.label}</span>
            <CountUp
              value={counts[filter.key]}
              format={(n) => String(Math.round(n))}
              className={`mt-0.5 block text-lead font-medium ${amber ? "text-pill-amber-ink" : "text-app-ink"}`}
            />
          </button>
        );
      })}
    </div>
  );
}