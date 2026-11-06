import { Block } from "@/components/console/FormBits";
import { SCORE_FIELDS } from "@/lib/supplier-rules";

/** Five sliders out of 20. The total is summed, never typed. */
export default function SupplierScoreBlock({ draft, set }) {
  const total = SCORE_FIELDS.reduce((sum, [field]) => sum + (Number(draft[field]) || 0), 0);

  return (
    <Block
      title="Scorecard"
      note="Each line is worth 20. Live needs a total of 70."
      action={
        <p className={`tabular text-title font-medium ${total >= 70 ? "text-app-ink" : "text-pill-amber-ink"}`}>
          {total}
          <span className="text-body text-app-meta">/100</span>
        </p>
      }
    >
      <ul className="space-y-3">
        {SCORE_FIELDS.map(([field, label]) => (
          <li key={field}>
            <div className="flex items-baseline justify-between">
              <span className="text-body">{label}</span>
              <span className="tabular text-body text-app-soft">{Number(draft[field]) || 0}</span>
            </div>
            <input
              type="range"
              min={0}
              max={20}
              step={1}
              value={Number(draft[field]) || 0}
              onChange={(event) => set({ [field]: Number(event.target.value) })}
              className="mt-1 h-11 w-full accent-data"
              aria-label={label}
            />
          </li>
        ))}
      </ul>
    </Block>
  );
}