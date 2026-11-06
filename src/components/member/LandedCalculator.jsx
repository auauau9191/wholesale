import CountUp from "@/components/motion/CountUp";
import DataBlock from "@/components/shell/DataBlock";
import { landedCost, quantityChips } from "@/services/pricing";
import { formatAud, formatQty, formatUsd } from "@/lib/format";

/** The landed cost at the quantity the member typed, line by line. */
export default function LandedCalculator({ product, settings, quantity, onQuantity }) {
  if (!settings) return <DataBlock state="loading" />;

  const cost = landedCost(product, quantity, settings);
  const chips = quantityChips(product);

  const rows = [
    ["Factory price", `${formatUsd(cost.unitFob)} a unit`],
    ["Goods", formatAud(cost.goods)],
    ["Freight", formatAud(cost.freight)],
    [
      cost.dutyRate > 0 ? `Duty (${Math.round(cost.dutyRate * 100)}%)` : "Duty (ChAFTA origin)",
      formatAud(cost.duty),
    ],
    ["Broker, per unit", formatAud(cost.broker)],
    [`GST (${Math.round(cost.gstRate * 100)}%)`, formatAud(cost.gst)],
  ];

  return (
    <section className="rounded-card border border-edge bg-sheet p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-lead font-medium">Landed cost</h2>
        <p className="text-label text-app-meta">A$, estimate</p>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {chips.map((chip) => {
          const active = quantity === chip;
          return (
            <button
              key={chip}
              type="button"
              onClick={() => onQuantity(chip)}
              aria-pressed={active}
              className={[
                "tabular inline-flex min-h-[36px] items-center rounded-full px-3.5 text-body transition-colors",
                active
                  ? "bg-app-ink text-sheet"
                  : "bg-pill-grey text-pill-grey-ink hover:bg-secondary",
              ].join(" ")}
            >
              {formatQty(chip)}
            </button>
          );
        })}
        <label className="flex items-center gap-2 text-label text-app-meta">
          Quantity
          <input
            type="number"
            inputMode="numeric"
            min={product.moq ?? 1}
            step="100"
            value={quantity}
            onChange={(event) => {
              const next = Number(event.target.value);
              onQuantity(Number.isFinite(next) && next > 0 ? Math.round(next) : product.moq ?? 1);
            }}
            className="tabular h-[36px] w-[104px] rounded-control border border-control bg-sheet px-2 text-body text-app-ink outline-none focus:border-app-ink"
          />
        </label>
      </div>

      <dl className="mt-5 space-y-2 text-body">
        {rows.map(([label, value]) => (
          <div key={label} className="flex items-baseline justify-between gap-4">
            <dt className="text-app-soft">{label}</dt>
            <dd className="tabular text-app-ink">{value}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-4 flex items-baseline justify-between gap-4 border-t border-rule pt-4">
        <p className="text-body font-medium">Landed per unit</p>
        <p className="text-title font-medium">
          <CountUp value={cost.landed} format={formatAud} />
        </p>
      </div>
      <div className="mt-1 flex items-baseline justify-between gap-4">
        <p className="text-body text-app-soft">
          {formatQty(cost.quantity)} units, order total
        </p>
        <p className="text-body">
          <CountUp value={cost.orderTotal} format={formatAud} />
        </p>
      </div>

      <p className="mt-4 max-w-[520px] text-label text-app-meta">
        Estimate. GST is claimable if you are GST-registered. Our broker confirms at order.
      </p>
    </section>
  );
}