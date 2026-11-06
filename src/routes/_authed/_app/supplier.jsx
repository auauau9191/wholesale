import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft } from "lucide-react";
import FilmPanel from "@/components/member/FilmPanel";
import ScoreBars from "@/components/member/ScoreBars";
import LockNotice from "@/components/member/LockNotice";
import SupplierProductRow from "@/components/member/SupplierProductRow";
import DataBlock from "@/components/shell/DataBlock";
import { getLiveSupplier, listLiveProducts } from "@/services/catalogService";
import { listUnitsForProducts } from "@/services/sampleService";
import { freeByProduct } from "@/lib/shelf";

export const Route = createFileRoute("/_authed/_app/supplier")({
  validateSearch: (search) => ({ code: search.code ? String(search.code) : undefined }),
  head: () => ({ meta: [{ title: "Supplier · Wholesale System" }] }),
  component: SupplierPage,
});

function SupplierPage() {
  const { code } = Route.useSearch();

  const { data: supplier, isLoading } = useQuery({
    queryKey: ["supplier", code],
    queryFn: () => getLiveSupplier(code),
    enabled: Boolean(code),
  });

  const { data: products = [] } = useQuery({
    queryKey: ["supplier-products", code],
    queryFn: () => listLiveProducts({ supplierCode: code, limit: 60 }),
    enabled: Boolean(code),
  });

  const { data: units = [] } = useQuery({
    queryKey: ["supplier-units", code, products.length],
    queryFn: () => listUnitsForProducts(products.map((product) => product.product_id)),
    enabled: products.length > 0,
  });

  const freeUnits = freeByProduct(units);
  const backTo = supplier?.category_codes?.[0]
    ? { to: "/category", search: { code: supplier.category_codes[0] } }
    : { to: "/browse" };

  if (isLoading) {
    return (
      <div className="space-y-5">
        <DataBlock state="loading" />
      </div>
    );
  }

  if (!supplier) {
    return (
      <DataBlock
        title="That supplier isn't open to members."
        note="Live suppliers appear in their category once verification is complete."
      />
    );
  }

  const trading = supplier.supplier_type === "trading_company";

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <Link
          {...backTo}
          aria-label="Back"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-control text-app-ink transition-colors hover:bg-pill-grey"
        >
          <ChevronLeft className="h-5 w-5" aria-hidden="true" />
        </Link>
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="tabular text-title font-medium tracking-[-0.01em]">
            Supplier {supplier.supplier_code}
          </h1>
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
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)] lg:items-start">
        <div className="space-y-5">
          <FilmPanel supplier={supplier} />

          <div>
            <h2 className="text-lead font-medium">{supplier.headline}</h2>
            <p className="mt-1.5 text-body text-app-meta">
              {[
                supplier.city,
                supplier.province,
                supplier.exporting_since_year ? `exporting since ${supplier.exporting_since_year}` : null,
                supplier.staff_count ? `${supplier.staff_count} staff` : null,
                supplier.production_lines,
              ]
                .filter(Boolean)
                .join(" · ")}
            </p>
          </div>

          <section className="rounded-card border border-edge bg-sheet p-5">
            <h2 className="text-lead font-medium">We checked</h2>
            <ul className="mt-3 space-y-2">
              {(supplier.checks_passed ?? []).map((check) => (
                <li key={check} className="flex gap-2.5 text-body">
                  <span aria-hidden="true" className="mt-[3px] text-data">
                    ✓
                  </span>
                  <span>{check}</span>
                </li>
              ))}
              {supplier.checks_passed?.length ? null : (
                <li className="text-body text-app-meta">No checks recorded yet.</li>
              )}
            </ul>
          </section>

          <LockNotice />
        </div>

        <aside className="space-y-5">
          <section className="rounded-card border border-edge bg-sheet p-5">
            <div className="flex items-baseline justify-between gap-3">
              <h2 className="text-lead font-medium">Verification score</h2>
              <p className="tabular text-lead font-medium">
                {supplier.verification_score ?? "—"} / 100
              </p>
            </div>
            <div className="mt-4">
              <ScoreBars supplier={supplier} />
            </div>
          </section>
        </aside>
      </div>

      <section>
        <h2 className="text-lead font-medium">Products with samples in Australia</h2>
        <div className="mt-3 space-y-2">
          {products.length === 0 ? (
            <DataBlock
              title="No products live yet."
              note="Products appear here once their first sample unit reaches a hub."
            />
          ) : null}
          {products.map((product) => (
            <SupplierProductRow
              key={product.product_id}
              product={product}
              freeUnits={freeUnits[product.product_id] ?? 0}
            />
          ))}
        </div>
      </section>
    </div>
  );
}