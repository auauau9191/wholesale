import { formatAudWhole } from "@/lib/format";

/** The order, locked to the unit the member held and its signed spec. */
export default function OrderCard({ data }) {
  const { order, unit, product, spec, settings } = data;
  if (!order) return null;
  const deposit = Math.round((Number(settings.depositRate) || 0) * 100);
  const rows = [
    ["Goods", formatAudWhole(order.goods)],
    ["Pre-shipment inspection", formatAudWhole(order.inspection)],
    ["Order total", formatAudWhole(order.total)],
    [`Deposit paid (${deposit}%)`, formatAudWhole(order.deposit)],
    ["Due after inspection passes", formatAudWhole(order.balance)],
  ];

  return (
    <div className="w-full max-w-[352px] border-2 border-ink bg-ground p-4 text-ink md:p-5">
      <p className="text-body font-medium">Order WS-0142</p>
      <p className="mt-1 text-body text-ink-soft">
        Locked to unit {unit?.label ?? "—"} · spec {spec?.rev ?? product.rev}
      </p>
      <dl className="mt-4 text-body">
        {rows.map(([label, value], index) => (
          <div
            key={label}
            className={`flex items-baseline justify-between gap-4 py-2 ${
              index === 2 ? "border-t border-ink/20 font-medium" : ""
            }`}
          >
            <dt className={index === 2 ? "" : "text-ink-soft"}>{label}</dt>
            <dd className="text-right tabular">{value}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-3 text-label text-ink-soft">
        {formatAudWhole(order.goods)} of goods at {order.qty.toLocaleString("en-AU")} units ·
        30% starts production.
      </p>
    </div>
  );
}