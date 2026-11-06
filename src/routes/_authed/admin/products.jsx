import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import DataBlock from "@/components/shell/DataBlock";
import PageHead from "@/components/shell/PageHead";
import { getProductList } from "@/services/adminService";
import { formatQty } from "@/lib/format";

export const Route = createFileRoute("/_authed/admin/products")({
  head: () => ({ meta: [{ title: "Products · Wholesale System" }] }),
  component: ProductsPage,
});

const HEAD = "px-3 py-2 text-left text-label font-normal text-app-meta first:pl-5 last:pr-5";
const CELL = "px-3 py-3 align-top first:pl-5 last:pr-5";
const STATUSES = ["live", "draft", "sample_unavailable", "retired"];

function ProductsPage() {
  const [status, setStatus] = useState("");
  const { data, isLoading, error } = useQuery({ queryKey: ["product-list"], queryFn: getProductList });
  const rows = (data?.rows ?? []).filter((row) => !status || row.status === status);
  const live = (data?.rows ?? []).filter((row) => row.status === "live").length;

  return (
    <div className="space-y-6">
      <PageHead
        title="Products"
        note={
          data
            ? `${data.rows.length} products, ${live} live. A product goes live once its spec is signed and a sample unit is on a shelf.`
            : "The catalogue, its price tiers and the signed spec behind each one."
        }
      />
      {isLoading ? <DataBlock state="loading" /> : null}
      {error ? <DataBlock state="error" note={error.message} /> : null}
      {data ? (
        <>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setStatus("")}
              aria-pressed={status === ""}
              className={["min-h-[36px] rounded-control border px-3 text-body", status === "" ? "border-data bg-pill-green text-pill-green-ink" : "border-control"].join(" ")}
            >
              All {data.rows.length}
            </button>
            {STATUSES.map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setStatus(value)}
                aria-pressed={status === value}
                className={["min-h-[36px] rounded-control border px-3 text-body", status === value ? "border-data bg-pill-green text-pill-green-ink" : "border-control"].join(" ")}
              >
                {value === "sample_unavailable" ? "Sample unavailable" : value[0].toUpperCase() + value.slice(1)}
              </button>
            ))}
          </div>

          <section className="rounded-card border border-edge bg-sheet">
            {rows.length ? (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[860px] text-body">
                  <thead>
                    <tr>
                      <th className={HEAD}>Product</th>
                      <th className={HEAD}>Supplier</th>
                      <th className={HEAD}>Status</th>
                      <th className={`${HEAD} text-right`}>MOQ</th>
                      <th className={`${HEAD} text-right`}>Tiers</th>
                      <th className={HEAD}>Revision</th>
                      <th className={`${HEAD} text-right`}>On the shelf</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row) => (
                      <tr key={row.product_id} className="border-t border-rule">
                        <td className={CELL}>
                          <Link
                            to="/admin/products/$productId"
                            params={{ productId: row.product_id }}
                            className="font-medium hover:underline"
                          >
                            {row.name}
                          </Link>
                          <p className="tabular text-label text-app-meta">{row.product_id}</p>
                        </td>
                        <td className={CELL}>
                          {row.supplier}
                          <p className="tabular text-label text-app-meta">{row.category}</p>
                        </td>
                        <td className={CELL}>{row.status === "sample_unavailable" ? "Sample unavailable" : row.status}</td>
                        <td className={`${CELL} tabular text-right`}>{formatQty(row.moq)}</td>
                        <td className={`${CELL} tabular text-right`}>{row.tiers}</td>
                        <td className={`${CELL} tabular`}>{row.revision ?? "—"}</td>
                        <td className={`${CELL} tabular text-right ${row.on_shelf ? "" : "text-alert"}`}>{row.on_shelf}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="px-5 py-6 text-body text-app-meta">No products with that status.</p>
            )}
          </section>
        </>
      ) : null}
    </div>
  );
}