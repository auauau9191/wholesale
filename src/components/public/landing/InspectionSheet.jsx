import { formatAudWhole } from "@/lib/format";

/** The inspection: an independent check against the sealed master. */
export default function InspectionSheet({ data }) {
  const { settings, product, spec, unit } = data;
  const rows = [
    ["Fee", `${formatAudWhole(settings.inspection)} at cost`],
    ["Checked against", unit ? `Sealed master ${unit.id}` : "The sealed master"],
    ["Spec revision", spec ? `${spec.rev}, signed` : product.rev],
    ["Booked", "When the deposit clears"],
    ["Report", "Held on your order page"],
  ];

  return (
    <div className="bg-paper p-5 text-ink md:p-8">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-lead font-medium">Inspection</h3>
        <span className="text-label text-ink-soft">Before the balance falls due</span>
      </div>
      <p className="mt-1 text-body text-ink-soft">
        {product.id} · pre-shipment, independent
      </p>
      <dl className="mt-5 divide-y divide-ink/10 text-body">
        {rows.map(([label, value]) => (
          <div key={label} className="flex items-baseline justify-between gap-6 py-2">
            <dt className="text-ink-soft">{label}</dt>
            <dd className="max-w-[62%] text-right">{value}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-4 text-body text-ink-soft">
        An inspector opens the cartons before they sail and compares the goods with the sealed
        master on our shelf. If anything is out, it is not shipped: the factory reworks, and the
        inspection is booked again before you pay the balance.
      </p>
    </div>
  );
}