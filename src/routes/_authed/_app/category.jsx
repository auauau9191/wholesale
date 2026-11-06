import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft } from "lucide-react";
import LoopVideo from "@/components/motion/LoopVideo";
import SupplierFilter from "@/components/member/SupplierFilter";
import SupplierCard from "@/components/member/SupplierCard";
import DataBlock from "@/components/shell/DataBlock";
import {
  getCategory,
  listLiveProducts,
  listLiveSuppliers,
} from "@/services/catalogService";

export const Route = createFileRoute("/_authed/_app/category")({
  validateSearch: (search) => ({ code: search.code ? String(search.code) : undefined }),
  head: () => ({ meta: [{ title: "Category · Wholesale System" }] }),
  component: CategoryPage,
});

function CategoryPage() {
  const { code } = Route.useSearch();
  const [filter, setFilter] = useState("all");

  const { data: category } = useQuery({
    queryKey: ["category", code],
    queryFn: () => getCategory(code),
    enabled: Boolean(code),
  });

  const { data: suppliers = [], isLoading } = useQuery({
    queryKey: ["category-suppliers", code],
    queryFn: () => listLiveSuppliers({ categoryCode: code }),
    enabled: Boolean(code),
  });

  const { data: products = [] } = useQuery({
    queryKey: ["category-products", code],
    queryFn: () => listLiveProducts({ categoryCode: code, limit: 200 }),
    enabled: Boolean(code),
  });

  const stats = products.reduce((tally, product) => {
    const entry = tally[product.supplier_code] ?? { count: 0, moq: null };
    entry.count += 1;
    entry.moq = entry.moq === null ? product.moq : Math.min(entry.moq, product.moq ?? entry.moq);
    tally[product.supplier_code] = entry;
    return tally;
  }, {});

  // The band is atmosphere: apparel knits, homewares runs a fabric line, the rest packs.
  const name = category?.name ?? "";
  const headerClip = /apparel|textile/i.test(name)
    ? "factory-yarn-cones"
    : /homeware|kitchen/i.test(name)
      ? "factory-fabric-line"
      : "factory-packing-line";

  const shown = suppliers.filter((supplier) => {
    if (filter === "factory") return supplier.supplier_type === "factory";
    if (filter === "trading_company") return supplier.supplier_type === "trading_company";
    if (filter === "score80") return (supplier.verification_score ?? 0) >= 80;
    return true;
  });

  return (
    <div className="space-y-5">
      <div className="flex items-start gap-2">
        <Link
          to="/browse"
          aria-label="Back to browse"
          className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-control text-app-ink transition-colors hover:bg-pill-grey"
        >
          <ChevronLeft className="h-5 w-5" aria-hidden="true" />
        </Link>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="tabular inline-flex h-6 items-center rounded-control bg-pill-green px-2 text-label text-pill-green-ink">
              {code ?? "—"}
            </span>
            <h1 className="text-title font-medium tracking-[-0.01em]">
              {category?.name ?? "Category"}
            </h1>
          </div>
          <p className="mt-2 text-body text-app-meta">
            Showing <span className="tabular">{shown.length}</span> of{" "}
            <span className="tabular">{suppliers.length}</span> · sorted by verification score
          </p>
        </div>
      </div>

      <LoopVideo name={headerClip} className="aspect-[16/5] w-full" caption />

      <SupplierFilter value={filter} onChange={setFilter} total={suppliers.length} />

      <p className="max-w-[560px] text-label text-app-meta">
        Legal names and contacts unlock when you order through us.
      </p>

      {isLoading ? <DataBlock state="loading" /> : null}

      {!isLoading && shown.length === 0 ? (
        <DataBlock
          title="No suppliers match this filter."
          note="Clear the filter to see every live supplier in this category."
        />
      ) : null}

      {shown.length > 0 ? (
        <div className="space-y-3">
          {shown.map((supplier) => (
            <SupplierCard
              key={supplier.supplier_code}
              supplier={supplier}
              productCount={stats[supplier.supplier_code]?.count ?? 0}
              minMoq={stats[supplier.supplier_code]?.moq ?? null}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}