import DataBlock from "@/components/shell/DataBlock";
import { landedCost, tierForQuantity } from "@/services/pricing";
import { formatAud, formatQty, formatUsd } from "@/lib/format";

/** What an order costs at each signed price tier. */
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
      <h2 className="px-5 pt-5 text-lead font-medium">What an order costs</h2>
      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[560px] text-body">
          <thead>
            <tr className="text-label text-app-meta">
              <th className="px-5 py-2 text-left font-normal">Order size</th>
              <th className="px-3 py-2 text-right font-normal">Factory price</th>
              <th className="px-3 py-2 text-right font-normal">Landed per unit</th>
              <th className="px-3 py-2 text-right font-normal">Order total</th>
              <th className="px-5 py-2 text-right font-normal">
                Deposit {depositRate ? `(${Math.round(depositRate * 100)}%)` : ""}
              </th>
            </tr>
          </thead>
          <tbody>
            {tiers.map((tier) => {
              const cost = landedCost(product, tier.min_qty, settings);
              const selected = activeTier?.min_qty === tier.min_qty;
              return (
                <tr
                  key={tier.min_qty}
                  className={[
                    "border-t border-rule",
                    selected ? "bg-pill-green text-pill-green-ink" : "",
                  ].join(" ")}
                >
                  <td className="tabular px-5 py-3">{formatQty(tier.min_qty)} units</td>
                  <td className="tabular px-3 py-3 text-right">{formatUsd(cost.unitFob)}</td>
                  <td className="tabular px-3 py-3 text-right">{formatAud(cost.landed)}</td>
                  <td className="tabular px-3 py-3 text-right">{formatAud(cost.orderTotal)}</td>
                  <td className="tabular px-5 py-3 text-right">
                    {formatAud(cost.orderTotal * depositRate)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}