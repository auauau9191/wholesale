const REASONS = [
  { key: "quality", label: "Quality" },
  { key: "size", label: "Size" },
  { key: "colour", label: "Colour" },
  { key: "price", label: "Price" },
  { key: "packaging", label: "Packaging" },
];

const ACTION =
  "mt-4 inline-flex min-h-[44px] w-full items-center justify-center rounded-control bg-app-ink px-4 text-body font-medium text-sheet transition-transform duration-150 active:scale-[0.97] disabled:opacity-40";

/** Reject with a reason: one free swap within the same category. */
export default function RejectPanel({ sample, reason, onReason, disabled, pending, onSubmit }) {
  const category = sample.category_name ? sample.category_name.toLowerCase() : "product in this category";
  return (
    <div className="mt-4 rounded-card bg-pill-amber p-4 text-body text-pill-amber-ink">
      <p className="font-medium">What was wrong?</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {REASONS.map((item) => (
          <button
            key={item.key}
            type="button"
            disabled={disabled}
            onClick={() => onReason(item.key)}
            aria-pressed={reason === item.key}
            className={`min-h-[36px] rounded-full border px-3 text-body transition-colors disabled:opacity-60 ${
              reason === item.key ? "border-pill-amber-ink bg-pill-amber-ink text-sheet" : "border-control bg-sheet text-app-ink"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
      <p className="mt-3">
        With a reason, you get <span className="font-medium">one free swap</span> to another {category}.
      </p>
      <button type="button" onClick={onSubmit} disabled={disabled || pending || !reason} className={ACTION}>
        {pending ? "Saving your decision" : "Choose a swap"}
      </button>
    </div>
  );
}