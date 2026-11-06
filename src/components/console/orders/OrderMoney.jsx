import { formatAud, formatAudWhole, formatUsd } from "@/lib/format";
import { formatDate } from "@/lib/format";

const Row = ({ label, value, strong = false }) => (
  <div className="flex items-baseline justify-between gap-3 border-b border-rule py-2 last:border-b-0">
    <span className={strong ? "text-body font-medium" : "text-body text-app-soft"}>{label}</span>
    <span className={`tabular ${strong ? "text-body font-medium" : "text-body"}`}>{value}</span>
  </div>
);

/** Every amount on the order. The supplier's side is only passed in for admins. */
export default function OrderMoney({ order, admin, payouts }) {
  return (
    <section className="rounded-card border border-edge bg-sheet p-5">
      <h2 className="text-lead font-medium">Money</h2>
      <div className="mt-3">
        <Row label={`Goods, ${order.quantity?.toLocaleString("en-AU")} units at ${formatUsd(order.unit_fob_usd)}`} value={formatAud(order.goods_aud)} />
        <Row label="Our fee" value={formatAud(order.buyer_fee_aud ?? 0)} />
        <Row label="Inspection, at cost" value={formatAud(order.inspection_aud ?? 0)} />
        <Row label="Total" value={formatAudWhole(order.total_aud)} strong />
        <Row label="Deposit" value={formatAudWhole(order.deposit_aud)} />
        <Row label="Balance" value={formatAudWhole(order.balance_aud)} />
      </div>

      {admin ? (
        <div className="mt-5 border-t border-rule pt-4">
          <h3 className="text-body font-medium">Supplier side</h3>
          <div className="mt-2">
            <Row label={`Commission, ${Math.round((order.commission_rate ?? 0) * 1000) / 10}%`} value={formatAud(order.commission_aud ?? 0)} />
            <Row label="Supplier payout total" value={formatAud(order.supplier_payout_total_aud ?? 0)} strong />
          </div>
          {payouts?.length ? (
            <ul className="mt-3 space-y-1">
              {payouts.map((payout) => (
                <li key={payout.id} className="tabular flex items-baseline justify-between gap-3 text-body">
                  <span className="text-app-soft">
                    {payout.payout_no} · {payout.stage}
                  </span>
                  <span>
                    {payout.currency} {Number(payout.amount_foreign ?? payout.net_aud).toLocaleString("en-AU", { maximumFractionDigits: 2 })} · {payout.status}
                    {payout.sent_on ? ` · ${formatDate(payout.sent_on)}` : ""}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-body text-app-meta">No payouts scheduled yet.</p>
          )}
        </div>
      ) : null}
    </section>
  );
}