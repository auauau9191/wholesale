import { formatDayMonthYear } from "@/lib/format";

const BAR_MAX = 20;

/** The factory report: the score, the five bars behind it, and what we checked. */
export default function FactoryReportSheet({ data }) {
  const { supplier } = data;
  if (!supplier) return null;
  const bars = [
    ["Production capability", supplier.capability],
    ["Quality system", supplier.quality],
    ["Communication", supplier.communication],
    ["Compliance", supplier.compliance],
    ["Export experience", supplier.exportScore],
  ];

  return (
    <div className="bg-paper p-5 text-ink md:p-8">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-lead font-medium">Factory report</h3>
        <span className="text-label text-ink-soft">Checked on the visit</span>
      </div>
      <p className="mt-1 text-body text-ink-soft">
        {supplier.code} · {supplier.type}, {supplier.city} · exporting since{" "}
        {supplier.exportingSince}
      </p>
      <p className="mt-5 text-body">
        <span className="font-medium">Verification score</span>{" "}
        <span className="tabular">
          {supplier.score} / 100
        </span>
        <span className="text-ink-soft"> · anything under 70 isn&apos;t listed</span>
      </p>
      <div className="mt-4 space-y-3">
        {bars.map(([label, value]) => (
          <div key={label}>
            <div className="flex items-baseline justify-between gap-3 text-body">
              <span>{label}</span>
              <span className="tabular">
                {value}/{BAR_MAX}
              </span>
            </div>
            <div aria-hidden="true" className="mt-1 h-[3px] w-full bg-ink/15">
              <div className="h-full bg-ink" style={{ width: `${((value ?? 0) / BAR_MAX) * 100}%` }} />
            </div>
          </div>
        ))}
      </div>
      <p className="mt-6 text-label text-ink-soft">What we checked</p>
      <ul className="mt-2 divide-y divide-ink/10 text-body">
        {supplier.checks.map((check) => (
          <li key={check} className="py-2">
            {check}
          </li>
        ))}
      </ul>
      <p className="mt-4 text-body text-ink-soft">
        Visited {formatDayMonthYear(supplier.visited)} · filmed{" "}
        {formatDayMonthYear(supplier.filmed)}. The board in every clip carries the supplier code
        and that date.
      </p>
    </div>
  );
}