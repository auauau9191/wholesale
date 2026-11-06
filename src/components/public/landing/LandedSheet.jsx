import { useState } from "react";
import CountUp from "@/components/motion/CountUp";
import { formatAudWhole } from "@/lib/format";

const cents = (value) => Number(value).toFixed(2);
const whole = (value) => Math.round(Number(value)).toLocaleString("en-AU");

/** The landed cost sheet: three quantities, every line, summed from what is shown. */
export default function LandedSheet({ data }) {
  const { product, settings, sheets } = data;
  const [qty, setQty] = useState(5000);
  const sheet = sheets.find((row) => row.qty === qty) ?? sheets[sheets.length - 1];
  if (!sheet) return null;

  const { unit, order } = sheet;
  const deposit = Math.round((Number(settings.depositRate) || 0) * 100);
  const commission = Math.round((Number(settings.commissionRate) || 0) * 100);
  const perUnit = [
    [`Product (US$${unit.fob.toFixed(2)} × ${unit.fx})`, unit.goods],
    ["Sea freight and insurance", unit.freight],
    [
      product.chafta ? "Duty, with ChAFTA origin certificate" : "Duty, no ChAFTA certificate",
      unit.duty,
    ],
    [`Broker and port fees (A$${unit.brokerFee} ÷ ${unit.qty.toLocaleString("en-AU")})`, unit.broker],
    [`GST, ${Math.round((Number(unit.gstRate) || 0) * 100)}%`, unit.gst],
  ];
  const lines = [
    ["Goods", order.goods],
    ["Wholesale System fee to you", order.memberFee],
    ["Pre-shipment inspection", order.inspection],
    ["Order total", order.total],
    [`Deposit (${deposit}%)`, order.deposit],
    [`Balance after inspection (${100 - deposit}%)`, order.balance],
  ];

  return (
    <div>
      <div className="bg-paper p-5 text-ink md:p-8">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h3 className="text-lead font-medium">Landed cost</h3>
          <span className="text-label text-ink-soft">Per unit, delivered</span>
        </div>
        <p className="mt-1 text-body text-ink-soft">
          {product.id} · {product.name.charAt(0) + product.name.slice(1).toLowerCase()} ·{" "}
          {product.port}
        </p>

        <div className="mt-5 flex flex-wrap gap-2">
          {sheets.map((row) => (
            <button
              key={row.qty}
              type="button"
              onClick={() => setQty(row.qty)}
              className={`min-h-[44px] px-4 text-body tabular transition-transform duration-150 active:scale-[0.97] ${
                row.qty === qty ? "bg-ink text-ground" : "bg-ink/5 text-ink hover:bg-ink/10"
              }`}
            >
              {row.qty.toLocaleString("en-AU")} units
            </button>
          ))}
        </div>

        <div className="mt-6">
          <div className="flex justify-between text-label text-ink-soft">
            <span>Per unit</span>
            <span>A$</span>
          </div>
          <dl className="mt-1 divide-y divide-ink/10 text-body">
            {perUnit.map(([label, value]) => (
              <div key={label} className="flex items-baseline justify-between gap-4 py-2">
                <dt>{label}</dt>
                <dd>
                  <CountUp value={value} format={cents} />
                </dd>
              </div>
            ))}
            <div className="flex items-baseline justify-between gap-4 py-2 font-medium">
              <dt>Landed, per unit</dt>
              <dd>
                <CountUp value={unit.landed} format={cents} />
              </dd>
            </div>
          </dl>
        </div>

        <div className="mt-6">
          <div className="flex justify-between text-label text-ink-soft">
            <span>This order</span>
            <span>A$</span>
          </div>
          <dl className="mt-1 divide-y divide-ink/10 text-body">
            {lines.map(([label, value], index) => (
              <div
                key={label}
                className={`flex items-baseline justify-between gap-4 py-2 ${
                  index === 3 ? "font-medium" : ""
                }`}
              >
                <dt className={index === 3 ? "" : "text-ink-soft"}>{label}</dt>
                <dd>
                  <CountUp value={value} format={whole} />
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      <p className="mt-4 max-w-[560px] text-body text-ink-soft">
        The factory pays us {commission}% of the goods (here {formatAudWhole(order.commission)})
        out of its own {formatAudWhole(order.goods)}; it is never added to your bill.
      </p>
    </div>
  );
}