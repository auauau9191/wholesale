import { Link } from "@tanstack/react-router";
import { formatMonthYear, formatQty } from "@/lib/format";

export default function SupplierCard({ supplier, productCount, minMoq }) {
  const trading = supplier.supplier_type === "trading_company";
  const filmed = formatMonthYear(supplier.filmed_date);

  return (
    <Link
      to="/supplier"
      search={{ code: supplier.supplier_code }}
      className="flex gap-4 rounded-card border border-edge bg-sheet p-4 transition-colors hover:border-control"
    >
      <div className="flex w-[60px] shrink-0 flex-col items-center justify-center rounded-card bg-app-ink py-3 text-sheet">
        <span className="tabular text-title leading-none">
          {supplier.verification_score ?? "—"}
        </span>
        <span className="mt-1 text-label text-sheet/70">score</span>
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="tabular text-body">{supplier.supplier_code}</span>
          <span
            className={[
              "rounded-full px-2 py-0.5 text-label",
              trading
                ? "bg-pill-amber text-pill-amber-ink"
                : "bg-pill-green text-pill-green-ink",
            ].join(" ")}
          >
            {trading ? "Trading co." : "Factory"}
          </span>
        </div>

        <p className="mt-1.5 text-lead font-medium leading-snug">{supplier.headline}</p>

        <p className="mt-1 text-body text-app-meta">
          {[
            supplier.city,
            productCount ? `${productCount} products` : "No products live yet",
            minMoq ? `MOQ from ${formatQty(minMoq)}` : null,
          ]
            .filter(Boolean)
            .join(" · ")}
        </p>

        {filmed ? (
          <p className="mt-2 text-label text-app-meta">Filmed on site · {filmed}</p>
        ) : null}
      </div>
    </Link>
  );
}