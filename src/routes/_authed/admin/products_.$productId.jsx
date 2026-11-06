import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ChevronLeft } from "lucide-react";
import DataBlock from "@/components/shell/DataBlock";
import ProductDetailsBlock from "@/components/console/product/ProductDetailsBlock";
import ProductColourBlock from "@/components/console/product/ProductColourBlock";
import ProductPriceBlock from "@/components/console/product/ProductPriceBlock";
import ProductComplianceBlock from "@/components/console/product/ProductComplianceBlock";
import ProductRevisionBlock from "@/components/console/product/ProductRevisionBlock";
import { primaryButton } from "@/components/console/FormBits";
import { getProductEditor, saveProduct } from "@/services/adminService";

export const Route = createFileRoute("/_authed/admin/products_/$productId")({
  head: () => ({ meta: [{ title: "Product · Wholesale System" }] }),
  component: ProductEditorPage,
});

const FIELDS = [
  "name", "short_description", "colours", "moq", "lead_time_days", "price_tiers", "incoterm_port",
  "freight_aud_per_unit_estimate", "hs_code_indicative", "has_chafta_origin_cert", "safety_flags",
  "biosecurity_flags", "test_reports", "master_hub", "category_code", "supplier_code", "status",
];

function ProductEditorPage() {
  const { productId } = Route.useParams();
  const queryClient = useQueryClient();
  const { data, isLoading, error } = useQuery({
    queryKey: ["product-editor", productId],
    queryFn: () => getProductEditor({ product_id: productId }),
  });
  const [draft, setDraft] = useState(null);

  useEffect(() => {
    if (data?.product) {
      setDraft(Object.fromEntries(FIELDS.map((field) => [field, data.product[field] ?? (Array.isArray(data.product[field]) ? [] : null)])));
    }
  }, [data]);

  const save = useMutation({
    mutationFn: () =>
      saveProduct({
        product_id: productId,
        patch: Object.fromEntries(Object.entries(draft).filter(([, value]) => value !== null && value !== undefined)),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-editor", productId] });
      toast("Product saved.");
    },
    onError: (error) => toast(error.message),
  });

  if (isLoading) return <DataBlock state="loading" />;
  if (error) return <DataBlock state="error" note={error.message} />;
  if (!data) return <DataBlock title="That product isn't here." note="Check the product ID, or open the catalogue." />;

  const set = (patch) => setDraft((current) => ({ ...current, ...patch }));
  const product = data.product;
  const onShelf = data.units.filter((unit) => unit.status === "in_stock" && !unit.is_master).length;

  return (
    <div className="space-y-5">
      <div className="flex items-start gap-2">
        <Link
          to="/admin/products"
          aria-label="Back to products"
          className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-control hover:bg-pill-grey"
        >
          <ChevronLeft className="h-5 w-5" aria-hidden="true" />
        </Link>
        <div className="min-w-0 flex-1">
          <h1 className="text-title font-medium tracking-[-0.01em]">{product.name}</h1>
          <p className="tabular mt-2 max-w-[680px] text-body text-app-meta">
            {product.product_id} · supplier {product.supplier_code} · MOQ {product.moq ?? "—"} ·{" "}
            {onShelf} on the shelf · current revision {product.current_spec_revision ?? "none"}.
          </p>
        </div>
        <button type="button" onClick={() => save.mutate()} disabled={!draft || save.isPending} className={primaryButton}>
          {save.isPending ? "Saving" : "Save changes"}
        </button>
      </div>

      {draft ? (
        <div className="grid gap-4 xl:grid-cols-2">
          <div className="space-y-4">
            <ProductDetailsBlock draft={draft} set={set} suppliers={data.suppliers} categories={data.categories} />
            <ProductColourBlock draft={draft} set={set} />
            <ProductPriceBlock draft={draft} set={set} moq={draft.moq} />
          </div>
          <div className="space-y-4">
            <ProductComplianceBlock draft={draft} set={set} />
            <ProductRevisionBlock productId={product.product_id} product={product} revisions={data.revisions} />
          </div>
        </div>
      ) : null}
    </div>
  );
}