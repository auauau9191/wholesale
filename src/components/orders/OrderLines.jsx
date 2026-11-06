import CountUp from "@/components/motion/CountUp";
import { formatAudWhole } from "@/lib/format";

/** Goods, our fee, inspection and the total, summed from those lines on the server. */
export default function OrderLines({ quote, commissionRate, showSplit = false }) {
  const fx = quote.fx_rate;
  const rows = [
    [`Goods (FOB, US$1 = A$${fx})`, quote.goods_aud],
    ["Our fee to you", quote.buyer_fee_aud],
    ["Pre-shipment inspection", quote.inspection_aud],
  ];
  return (
    <div>
      <dl className="space-y-2 text-body">
        {rows.map(([label, value]) => (
          <div key={label} className="flex items-baseline justify-between gap-4">
            <dt className="text-app-soft">{label}</dt>
            <dd><CountUp value={value} format={formatAudWhole} /></dd>
          </div>
        ))}
      </dl>
      <div className="mt-4 flex items-baseline justify-between gap-4 border-t border-rule pt-4">
        <p className="text-lead font-medium">Order total</p>
        <p className="text-title font-medium text-data">
          <CountUp value={quote.total_aud} format={formatAudWhole} />
        </p>
      </div>
      {showSplit ? (
        <dl className="mt-2 space-y-1 text-body">
          <div className="flex justify-between gap-4"><dt className="text-app-soft">Deposit</dt><dd className="tabular">{formatAudWhole(quote.deposit_aud)}</dd></div>
          <div className="flex justify-between gap-4"><dt className="text-app-soft">Balance after inspection</dt><dd className="tabular">{formatAudWhole(quote.balance_aud)}</dd></div>
        </dl>
      ) : null}
      <p className="mt-4 max-w-[520px] text-label text-app-meta">
        The factory pays us {Math.round((commissionRate ?? 0) * 100)}% of the goods from its side. It is never added to
        your bill. Freight, duty and GST are quoted separately by our broker partner.
      </p>
    </div>
  );
}