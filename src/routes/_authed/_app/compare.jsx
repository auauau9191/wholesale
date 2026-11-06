import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import PageHead from "@/components/shell/PageHead";
import DataBlock from "@/components/shell/DataBlock";
import CompareTable from "@/components/member/CompareTable";
import useAppSettings from "@/hooks/useAppSettings";
import { getLiveSupplier, getProduct } from "@/services/catalogService";
import { listUnitsForProducts } from "@/services/sampleService";
import { freeByProduct } from "@/lib/shelf";
import { useCompare } from "@/lib/compare";

export const Route = createFileRoute("/_authed/_app/compare")({
  head: () => ({ meta: [{ title: "Compare · Wholesale System" }] }),
  component: ComparePage,
});

function ComparePage() {
  const { ids, remove, clear } = useCompare();
  const { data: settings } = useAppSettings();

  const { data: rows = [], isLoading } = useQuery({
    queryKey: ["compare-rows", ids.join(",")],
    queryFn: async () => {
      const products = (await Promise.all(ids.map((id) => getProduct(id)))).filter(Boolean);
      const units = await listUnitsForProducts(products.map((item) => item.product_id));
      const suppliers = await Promise.all(
        [...new Set(products.map((item) => item.supplier_code))].map((code) =>
          getLiveSupplier(code)
        )
      );
      const scores = suppliers
        .filter(Boolean)
        .reduce((tally, supplier) => {
          tally[supplier.supplier_code] = supplier.verification_score ?? null;
          return tally;
        }, {});
      const free = freeByProduct(units);
      return products.map((product) => ({
        product,
        score: scores[product.supplier_code] ?? null,
        freeUnits: free[product.product_id] ?? 0,
      }));
    },
    enabled: ids.length > 0,
  });

  return (
    <div className="space-y-6">
      <PageHead
        title="Compare"
        note="Up to four products side by side on price, landed cost and what is on our shelf."
        action={
          ids.length > 0 ? (
            <button
              type="button"
              onClick={clear}
              className="min-h-[36px] text-body text-app-meta transition-colors hover:text-app-ink"
            >
              Clear all
            </button>
          ) : null
        }
      />

      {isLoading && ids.length > 0 ? <DataBlock state="loading" /> : null}

      {!isLoading && rows.length === 0 ? (
        <DataBlock
          title="Nothing to compare yet."
          note="Add products from the catalogue and they line up here."
          action={
            <Link
              to="/browse"
              className="inline-flex min-h-[36px] items-center rounded-control bg-app-ink px-3 text-body text-sheet"
            >
              Browse products
            </Link>
          }
        />
      ) : null}

      {rows.length > 0 ? (
        <CompareTable rows={rows} settings={settings} onRemove={remove} />
      ) : null}
    </div>
  );
}