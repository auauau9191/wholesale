import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { searchProducts } from "@/services/catalogService";

/** Product name, supplier code or product ID. */
export default function CatalogueSearch() {
  const [term, setTerm] = useState("");
  const active = term.trim().length >= 2;

  const { data: results = [], isFetching } = useQuery({
    queryKey: ["catalogue-search", term.trim()],
    queryFn: () => searchProducts(term),
    enabled: active,
    staleTime: 30_000,
  });

  return (
    <div>
      <input
        type="search"
        value={term}
        onChange={(event) => setTerm(event.target.value)}
        placeholder="e.g. phone case, PC-CN014-0087"
        aria-label="Search the catalogue"
        className="h-[44px] w-full rounded-control border border-control bg-sheet px-3 text-body text-app-ink outline-none placeholder:text-app-meta focus:border-app-ink"
      />

      {active && isFetching ? (
        <p className="mt-2 text-label text-app-meta">Searching…</p>
      ) : null}

      {active && !isFetching && results.length === 0 ? (
        <p className="mt-2 text-body text-app-meta">
          Nothing matches “{term.trim()}”. Try a category below.
        </p>
      ) : null}

      {results.length > 0 ? (
        <ul className="mt-3 divide-y divide-rule overflow-hidden rounded-card border border-edge bg-sheet">
          {results.map((product) => (
            <li key={product.product_id}>
              <Link
                to="/product"
                search={{ id: product.product_id }}
                className="flex min-h-[56px] items-center justify-between gap-4 px-4 py-3 transition-colors hover:bg-pill-grey/40"
              >
                <span className="min-w-0">
                  <span className="block truncate text-body font-medium">{product.name}</span>
                  <span className="tabular mt-0.5 block text-label text-app-meta">
                    {product.product_id} · {product.supplier_code}
                  </span>
                </span>
                <span className="shrink-0 text-label text-app-meta">Open</span>
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}