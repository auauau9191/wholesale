import DataBlock from "@/components/shell/DataBlock";
import { landedCost, orderCost, tierForQuantity } from "@/services/pricing";
import { formatAud, formatAudWhole, formatQty, formatUsd } from "@/lib/format";

/**
 * What an order costs at each signed price tier. Order total and deposit use the
 * same lines as the bulk order: goods + our fee + inspection, deposit of that.
 */
export default function PriceTiers({ product, settings, quantity }) {
  if (!settings) return <DataBlock state="loading" />;

  const tiers = [...(product.price_tiers ?? [])].sort((a, b) => a.min_qty - b.min_qty);
  const depositRate = Number(settings?.deposit_rate) || 0;
  const activeTier = tierForQuantity(product, quantity);

  if (tiers.length === 0) {
    return (
      <section className="rounded-card border border-edge bg-sheet p-5">
        <h2 className="text-lead font-medium">What an order costs</h2>
        <p className="mt-2 text-body text-app-meta">No price tiers are signed yet.</p>
      </section>
    );
  }

  return (
    <section className="rounded-card border border-edge bg-sheet">
      <div className="flex flex-wrap items-baseline justify-between gap-2 px-5 pt-5">
        <h2 className="text-lead font-medium">What an order costs</h2>
        <p className="tabular text-label text-app-meta">US$1 = A${settings.fx_usd_to_aud}</p>
      </div>
      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[560px] text-body">
          <thead>
            <tr className="text-label text-app-meta">
              <th className="px-5 py-2 text-left font-normal">Order size</th>
              <th className="px-3 py-2 text-right font-normal">Factory price</th>
              <th className="px-3 py-2 text-right font-normal">Landed per unit</th>
              <th className="px-3 py-2 text-right font-normal">Order total</th>
              <th className="px-5 py-2 text-right font-normal">Deposit, {Math.round(depositRate * 100)}%</th>
            </tr>
          </thead>
          <tbody>
            {tiers.map((tier) => {
              const landed = landedCost(product, tier.min_qty, settings);
              const order = orderCost(product, tier.min_qty, settings);
              const selected = activeTier?.min_qty === tier.min_qty;
              return (
                <tr
                  key={tier.min_qty}
                  aria-current={selected ? "true" : undefined}
                  className={["border-t border-rule", selected ? "bg-pill-grey font-medium" : ""].join(" ")}
                >
                  <td className="tabular px-5 py-3">{formatQty(tier.min_qty)} units</td>
                  <td className="tabular px-3 py-3 text-right">{formatUsd(order.unitFob)}</td>
                  <td className="tabular px-3 py-3 text-right">{formatAud(landed.landed)}</td>
                  <td className="tabular px-3 py-3 text-right">{formatAudWhole(order.total)}</td>
                  <td className="tabular px-5 py-3 text-right">{formatAudWhole(order.deposit)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}