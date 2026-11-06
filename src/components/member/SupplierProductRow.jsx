import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";

export default function SupplierProductRow({ product, freeUnits }) {
  const swatch = product.colours?.[0]?.hex ?? "#23290f";

  return (
    <Link
      to="/product"
      search={{ id: product.product_id }}
      className="flex items-center gap-3 rounded-card border border-edge bg-sheet px-4 py-3 transition-colors hover:border-control"
    >
      <span
        className="h-12 w-12 shrink-0 rounded-card border border-edge"
        style={{ background: swatch }}
        aria-hidden="true"
      />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-body font-medium">{product.name}</span>
        <span className="tabular mt-0.5 block text-label text-app-meta">
          {product.product_id}
        </span>
        <span
          className={[
            "mt-0.5 block text-label",
            freeUnits > 0 ? "text-data" : "text-app-meta",
          ].join(" ")}
        >
          {freeUnits > 0
            ? `${freeUnits} sample units available`
            : "No sample units free to send"}
        </span>
      </span>
      <ChevronRight className="h-4 w-4 shrink-0 text-app-meta" aria-hidden="true" />
    </Link>
  );
}