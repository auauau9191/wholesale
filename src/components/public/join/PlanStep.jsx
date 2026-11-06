export default function PlanStep({ plans, plan, onSelect, footnote }) {
  return (
    <div>
      <div className="mt-6 space-y-2">
        {plans.map((option) => {
          const selected = option.key === plan;
          return (
            <button
              key={option.key}
              type="button"
              aria-pressed={selected}
              onClick={() => onSelect(option.key)}
              className={`flex w-full items-start justify-between gap-6 p-6 text-left transition-colors duration-150 ${
                selected ? "bg-paper" : "bg-surface"
              }`}
            >
              <span className="flex min-w-0 items-start gap-4">
                <span
                  className={`mt-[3px] flex h-4 w-4 shrink-0 items-center justify-center rounded-full ${
                    selected ? "bg-ink" : "border border-ink-soft"
                  }`}
                >
                  {selected ? <span className="h-[6px] w-[6px] rounded-full bg-paper" /> : null}
                </span>
                <span className="min-w-0">
                  <span className="block text-lead font-medium">{option.name}</span>
                  <span className="mt-2 block max-w-[400px] text-body text-ink-soft">
                    {option.note}
                  </span>
                </span>
              </span>
              <span className="tabular shrink-0 text-title font-medium">{option.price}</span>
            </button>
          );
        })}
      </div>
      {footnote ? <p className="mt-5 max-w-[560px] text-body text-ink-soft">{footnote}</p> : null}
    </div>
  );
}