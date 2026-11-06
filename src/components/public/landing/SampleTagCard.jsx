import TagMark from "@/components/public/landing/TagMark";
import { formatDayMonthYear } from "@/lib/format";

/** The sample tag: the unit, what it is, and where it sits. */
export default function SampleTagCard({ data }) {
  const { unit, product, supplier, category, spec } = data;
  const unitLabel = unit ? `${unit.label} of ${unit.of} · shelf ${unit.shelf}` : "—";
  const rows = [
    ["Category", category ? `${category.code} · ${category.name}` : "—"],
    ["Supplier", supplier ? `${supplier.code} · ${supplier.type}, ${supplier.city}` : "—"],
    ["Product", product ? `${product.id.split("-").pop()} · ${product.name.toLowerCase()}` : "—"],
    ["Colour", unit ? `${unit.colour} · ${(spec?.colour ?? "").split(" (")[0] || "—"}` : "—"],
    ["Spec", spec ? `${spec.rev} · signed ${formatDayMonthYear(spec.signed)}` : "—"],
    ["Unit", unitLabel],
  ];

  return (
    <div className="w-full max-w-[352px] bg-paper p-5 text-ink md:p-6">
      <span aria-hidden="true" className="mx-auto block h-1.5 w-1.5 rounded-full bg-ink" />
      <p className="mt-3 text-center text-body font-medium tabular">{unit?.id ?? "—"}</p>
      <div aria-hidden="true" className="mt-4 h-px w-full bg-ink/15" />
      <dl className="mt-3 text-body">
        {rows.map(([label, value]) => (
          <div key={label} className="flex items-baseline justify-between gap-4 py-1">
            <dt className="text-ink-soft">{label}</dt>
            <dd className="text-right tabular">{value}</dd>
          </div>
        ))}
      </dl>
      <div className="mt-4 flex items-end justify-between gap-4">
        <p className="text-label text-ink-soft">Sample - not for resale</p>
        <TagMark seed={unit?.id ?? "tag"} className="h-12 w-12 text-ink" />
      </div>
    </div>
  );
}