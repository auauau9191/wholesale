/** Where the sample is: requested, packed, on its way, delivered. */
export default function SampleTracker({ data }) {
  const { unit, product, settings } = data;
  const current = 2;
  const steps = [
    ["Requested", "Order received"],
    ["Packed", unit ? `Unit ${unit.label} · shelf ${unit.shelf}` : "—"],
    ["On its way", `${settings.dispatchDays} business days`],
    ["Delivered", `${settings.decisionDays} days to decide`],
  ];

  return (
    <div className="w-full max-w-[352px] border-2 border-ink bg-ground p-4 text-ink md:p-5">
      <p className="text-body font-medium">Sample {unit?.label ?? "—"}</p>
      <p className="mt-1 text-body text-ink-soft">
        {product.id} · {unit?.colour ?? "—"}
      </p>
      <ol className="mt-5 space-y-4">
        {steps.map(([label, detail], index) => (
          <li key={label} className="flex items-start gap-3">
            <span
              aria-hidden="true"
              className={
                index < current
                  ? "mt-[3px] h-2.5 w-2.5 shrink-0 bg-ink"
                  : index === current
                    ? "mt-[1px] h-2.5 w-2.5 shrink-0 border-2 border-ink"
                    : "mt-[3px] h-2.5 w-2.5 shrink-0 bg-ink/20"
              }
            />
            <span className="min-w-0">
              <span className="block text-body">{label}</span>
              <span className="block text-label text-ink-soft">{detail}</span>
            </span>
          </li>
        ))}
      </ol>
      <p className="mt-5 text-label text-ink-soft">
        One sample at a time. The next request opens when you decide.
      </p>
    </div>
  );
}