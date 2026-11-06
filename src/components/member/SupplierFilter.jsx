const CHIPS = [
  { key: "all", label: "All" },
  { key: "factory", label: "Factories" },
  { key: "trading_company", label: "Trading cos" },
  { key: "score80", label: "Score 80+" },
];

export default function SupplierFilter({ value, onChange, total }) {
  return (
    <div className="flex flex-wrap gap-2">
      {CHIPS.map((chip) => {
        const active = value === chip.key;
        return (
          <button
            key={chip.key}
            type="button"
            onClick={() => onChange(chip.key)}
            aria-pressed={active}
            className={[
              "inline-flex min-h-[36px] items-center rounded-full px-3.5 text-body transition-colors",
              active
                ? "bg-app-ink text-sheet"
                : "bg-pill-grey text-pill-grey-ink hover:bg-secondary",
            ].join(" ")}
          >
            {chip.label}
            {chip.key === "all" ? <span className="tabular ml-1.5">{total}</span> : null}
          </button>
        );
      })}
    </div>
  );
}