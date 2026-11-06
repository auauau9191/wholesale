import { formatDayMonthYear } from "@/lib/format";

/** The spec sheet: the revision the order is locked to. */
export default function SpecSheet({ data }) {
  const { spec, product, unit } = data;
  if (!spec) return null;
  const rows = [
    ["Revision", spec.rev],
    ["Signed", formatDayMonthYear(spec.signed)],
    ["Materials", spec.materials],
    ["Dimensions", spec.dimensions],
    ["Weight", `${spec.weight} g`],
    ["Colour", spec.colour],
    ["Finish", spec.finish],
    ["Tolerances", spec.tolerances],
    ["Packaging", spec.packaging],
    ["Labelling", spec.labelling],
  ];

  return (
    <div className="bg-paper p-5 text-ink md:p-8">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-lead font-medium">Spec sheet</h3>
        <span className="text-label text-ink-soft">Signed by the factory</span>
      </div>
      <p className="mt-1 text-body text-ink-soft">
        {product.id} · revision {spec.rev}
        {unit ? ` · sealed as ${unit.id}` : ""}
      </p>
      <dl className="mt-5 divide-y divide-ink/10 text-body">
        {rows.map(([label, value]) => (
          <div key={label} className="flex items-baseline justify-between gap-6 py-2">
            <dt className="text-ink-soft">{label}</dt>
            <dd className="max-w-[62%] text-right">{value || "—"}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-4 text-body text-ink-soft">
        Your order is placed against this revision. The master on our shelf is sealed to it, and
        the inspection compares the cartons with that master.
      </p>
    </div>
  );
}