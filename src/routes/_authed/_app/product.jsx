import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { ChevronLeft } from "lucide-react";
import ProductGallery from "@/components/member/ProductGallery";
import ColourSelector from "@/components/member/ColourSelector";
import LandedCalculator from "@/components/member/LandedCalculator";
import PriceTiers from "@/components/member/PriceTiers";
import ComplianceCard from "@/components/member/ComplianceCard";
import SampleRequestBar from "@/components/member/SampleRequestBar";
import DataBlock from "@/components/shell/DataBlock";
import useAppSettings from "@/hooks/useAppSettings";
import {
  getCategory,
  getLiveSupplier,
  getProduct,
  listSpecRevisions,
} from "@/services/catalogService";
import { listUnitsForProduct } from "@/services/sampleService";
import { freeToSend } from "@/lib/shelf";
import { useCompare } from "@/lib/compare";
import { formatDate } from "@/lib/format";

export const Route = createFileRoute("/_authed/_app/product")({
  validateSearch: (search) => ({ id: search.id ? String(search.id) : undefined }),
  head: () => ({ meta: [{ title: "Product · Wholesale System" }] }),
  component: ProductPage,
});

function ProductPage() {
  const { id } = Route.useSearch();
  const { data: settings } = useAppSettings();
  const compare = useCompare();

  const { data: product, isLoading } = useQuery({
    queryKey: ["product", id],
    queryFn: () => getProduct(id),
    enabled: Boolean(id),
  });

  const { data: category } = useQuery({
    queryKey: ["category", product?.category_code],
    queryFn: () => getCategory(product.category_code),
    enabled: Boolean(product?.category_code),
  });

  const { data: supplier } = useQuery({
    queryKey: ["supplier", product?.supplier_code],
    queryFn: () => getLiveSupplier(product.supplier_code),
    enabled: Boolean(product?.supplier_code),
  });

  const { data: revisions = [] } = useQuery({
    queryKey: ["spec-revisions", id],
    queryFn: () => listSpecRevisions(id),
    enabled: Boolean(id),
  });

  const { data: units = [] } = useQuery({
    queryKey: ["product-units", id],
    queryFn: () => listUnitsForProduct(id),
    enabled: Boolean(id),
  });

  const [quantity, setQuantity] = useState(null);
  const [colourName, setColourName] = useState(null);

  if (isLoading) {
    return <DataBlock state="loading" />;
  }

  if (!product) {
    return (
      <DataBlock
        title="That product isn't open to members."
        note="Browse the live catalogue or search by product ID."
      />
    );
  }

  const colour = product.colours?.find((item) => item.name === colourName) ?? product.colours?.[0] ?? null;
  const qty = quantity ?? product.moq ?? 1;
  const freeUnits = freeToSend(units);

  const signedRevision =
    revisions.find((revision) => revision.revision === product.current_spec_revision) ??
    revisions.find((revision) => revision.status === "signed");

  const specChip = product.current_spec_revision
    ? `spec ${product.current_spec_revision}${signedRevision?.signed_date ? ` · signed ${formatDate(signedRevision.signed_date)}` : " · signed"}`
    : null;

  const inCompare = compare.has(product.product_id);

  const addToCompare = () => {
    if (inCompare) return;
    if (compare.atLimit) {
      toast("Compare holds four products. Remove one to add this.");
      return;
    }
    compare.add(product.product_id);
    toast(`${product.name} added to compare.`);
  };

  return (
    <div>
      <div className="flex items-center gap-2">
        <Link
          to="/category"
          search={{ code: product.category_code }}
          aria-label="Back to category"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-control text-app-ink transition-colors hover:bg-pill-grey"
        >
          <ChevronLeft className="h-5 w-5" aria-hidden="true" />
        </Link>
        <p className="text-body text-app-meta">
          <Link
            to="/category"
            search={{ code: product.category_code }}
            className="hover:text-app-ink hover:underline"
          >
            {category?.name ?? product.category_code}
          </Link>
          {" / "}
          <Link
            to="/supplier"
            search={{ code: product.supplier_code }}
            className="tabular hover:text-app-ink hover:underline"
          >
            Supplier {product.supplier_code}
          </Link>
        </p>
      </div>

      <div className="mt-4 grid gap-6 lg:grid-cols-[minmax(0,400px)_minmax(0,1fr)] lg:gap-8">
        <div className="space-y-4">
          <ProductGallery product={product} colour={colour} />
          <ColourSelector
            colours={product.colours}
            value={colour}
            onChange={(next) => setColourName(next.name)}
          />
        </div>

        <div className="space-y-5">
          <div>
            <h1 className="text-title font-medium tracking-[-0.01em]">{product.name}</h1>

            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className="tabular rounded-control border border-control px-2 py-1 text-label text-app-ink">
                {product.product_id}
              </span>
              {specChip ? (
                <span className="tabular rounded-control border border-control px-2 py-1 text-label text-app-ink">
                  {specChip}
                </span>
              ) : null}
            </div>

            <p className="mt-2.5 text-body text-app-meta">
              {[
                `Supplier ${product.supplier_code}`,
                supplier?.supplier_type === "trading_company" ? "trading co." : "factory",
                supplier?.city,
              ]
                .filter(Boolean)
                .join(", ")}
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={addToCompare}
                disabled={inCompare}
                className="min-h-[36px] rounded-control border border-control px-3 text-body text-app-ink transition-colors hover:border-app-ink disabled:text-app-meta"
              >
                {inCompare ? "In compare" : "Add to compare"}
              </button>
              <Link
                to="/compare"
                className="min-h-[36px] rounded-control px-2 text-body text-app-meta hover:text-app-ink"
              >
                Compare {compare.ids.length}/4
              </Link>
            </div>

            <p className="mt-4 max-w-[560px] text-body text-app-soft">
              <span className="tabular">{freeUnits}</span> sample units are on our shelf in
              Australia. Every order is locked to the sample you approve.
            </p>
          </div>

          <LandedCalculator
            product={product}
            settings={settings}
            quantity={qty}
            onQuantity={setQuantity}
          />

          <PriceTiers product={product} settings={settings} quantity={qty} />

          <ComplianceCard product={product} settings={settings} />
        </div>
      </div>

      <SampleRequestBar
        freeUnits={freeUnits}
        dispatchDays={settings?.dispatch_business_days}
      />
    </div>
  );
}