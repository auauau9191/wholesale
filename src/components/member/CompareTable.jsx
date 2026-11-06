import { Link } from "@tanstack/react-router";
import { landedCost, tierForQuantity } from "@/services/pricing";
import { formatAud, formatQty, formatUsd } from "@/lib/format";

export default function CompareTable({ rows, settings, onRemove }) {
  const attributes = [
    {
      label: "Price at MOQ",
      value: (row) => formatUsd(tierForQuantity(row.product, row.product.moq)?.fob_usd),
    },
    { label: "MOQ", value: (row) => `${formatQty(row.product.moq)} units` },
    {
      label: "Lead time",
      value: (row) =>
        row.product.lead_time_days ? `${formatQty(row.product.lead_time_days)} days` : "—",
    },
    {
      label: "Landed at 2,000",
      value: (row) => `${formatAud(landedCost(row.product, 2000, settings).landed)} a unit`,
    },
    { label: "Supplier score", value: (row) => (row.score == null ? "—" : `${row.score} / 100`) },
    {
      label: "Samples in Australia",
      value: (row) => `${formatQty(row.freeUnits)} units`,
    },
  ];

  return (
    <div className="overflow-x-auto rounded-card border border-edge bg-sheet">
      <table className="w-full min-w-[640px] text-body">
        <thead>
          <tr>
            <th className="w-[176px] px-4 py-4 text-left align-bottom text-label font-normal text-app-meta">
              Product
            </th>
            {rows.map((row) => (
              <th key={row.product.product_id} className="px-4 py-4 text-left align-bottom">
                <Link
                  to="/product"
                  search={{ id: row.product.product_id }}
                  className="block text-body font-medium leading-snug hover:underline"
                >
                  {row.product.name}
                </Link>
                <span className="tabular mt-0.5 block text-label font-normal text-app-meta">
                  {row.product.product_id}
                </span>
                <button
                  type="button"
                  onClick={() => onRemove(row.product.product_id)}
                  className="mt-2 text-label font-normal text-app-meta hover:text-app-ink"
                >
                  Remove
                </button>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {attributes.map((attribute) => (
            <tr key={attribute.label} className="border-t border-rule">
              <th className="px-4 py-3 text-left text-label font-normal text-app-meta">
                {attribute.label}
              </th>
              {rows.map((row) => (
                <td
                  key={row.product.product_id}
                  className="tabular px-4 py-3 text-right text-app-ink"
                >
                  {attribute.value(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}