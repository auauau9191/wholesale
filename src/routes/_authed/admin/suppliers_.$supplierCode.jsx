import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ChevronLeft } from "lucide-react";
import DataBlock from "@/components/shell/DataBlock";
import SupplierProfileBlock from "@/components/console/supplier/SupplierProfileBlock";
import SupplierVisitBlock from "@/components/console/supplier/SupplierVisitBlock";
import SupplierScoreBlock from "@/components/console/supplier/SupplierScoreBlock";
import SupplierFilmBlock from "@/components/console/supplier/SupplierFilmBlock";
import SupplierAgreementBlock from "@/components/console/supplier/SupplierAgreementBlock";
import SupplierCommercialBlock from "@/components/console/supplier/SupplierCommercialBlock";
import SupplierNotes from "@/components/console/supplier/SupplierNotes";
import { primaryButton } from "@/components/console/FormBits";
import { getSupplierEditor, saveSupplier } from "@/services/adminService";
import { STAGE_LABEL } from "@/lib/supplier-rules";

export const Route = createFileRoute("/_authed/admin/suppliers_/$supplierCode")({
  head: () => ({ meta: [{ title: "Supplier · Wholesale System" }] }),
  component: SupplierEditorPage,
});

const FIELDS = [
  "headline", "supplier_type", "province", "city", "exporting_since_year", "staff_count", "production_lines",
  "category_codes", "legal_name", "contact_name", "contact_email", "contact_wechat", "internal_notes",
  "visit_date", "filmed_date", "checks_passed", "score_capability", "score_quality", "score_communication",
  "score_compliance", "score_export", "video_url", "video_chapters", "agreement_status",
  "non_circumvention_signed", "commission_rate", "listing_fee_paid_until", "listing_fee_waived",
  "payout_currency", "payout_method", "payout_account_ref",
];

const toDraft = (supplier) =>
  Object.fromEntries(FIELDS.map((field) => [field, supplier[field] === undefined ? null : supplier[field]]));

function SupplierEditorPage() {
  const { supplierCode } = Route.useParams();
  const queryClient = useQueryClient();
  const { data, isLoading, error } = useQuery({
    queryKey: ["supplier-editor", supplierCode],
    queryFn: () => getSupplierEditor({ code: supplierCode }),
  });
  const [draft, setDraft] = useState(null);

  useEffect(() => {
    if (data?.supplier) setDraft(toDraft(data.supplier));
  }, [data]);

  const save = useMutation({
    mutationFn: () =>
      saveSupplier({
        supplier_id: data.supplier.id,
        // An empty commission rate is meaningful (it falls back to the default); other blanks are left untouched.
        patch: Object.fromEntries(Object.entries(draft).filter(([key, value]) => value !== null || key === "commission_rate")),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["supplier-editor", supplierCode] });
      queryClient.invalidateQueries({ queryKey: ["supplier-board"] });
      toast("Supplier saved.");
    },
    onError: (error) => toast(error.message),
  });

  if (isLoading) return <DataBlock state="loading" />;
  if (error) return <DataBlock state="error" note={error.message} />;
  if (!data) return <DataBlock title="That supplier isn't here." note="Check the code, or open the pipeline." />;

  const set = (patch) => setDraft((current) => ({ ...current, ...patch }));
  const supplier = data.supplier;

  return (
    <div className="space-y-5">
      <div className="flex items-start gap-2">
        <Link
          to="/admin/suppliers"
          aria-label="Back to suppliers"
          className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-control hover:bg-pill-grey"
        >
          <ChevronLeft className="h-5 w-5" aria-hidden="true" />
        </Link>
        <div className="min-w-0 flex-1">
          <h1 className="text-title font-medium tracking-[-0.01em]">{supplier.headline ?? supplier.supplier_code}</h1>
          <p className="tabular mt-2 max-w-[680px] text-body text-app-meta">
            {supplier.supplier_code} · {STAGE_LABEL[supplier.pipeline_stage] ?? supplier.pipeline_stage} ·{" "}
            {supplier.verification_score ?? 0}/100
            {data.gaps.length
              ? ` · ${data.gaps.length} ${data.gaps.length === 1 ? "condition" : "conditions"} still missing for live.`
              : " · meets every condition for live."}
          </p>
        </div>
        <button type="button" onClick={() => save.mutate()} disabled={!draft || save.isPending} className={primaryButton}>
          {save.isPending ? "Saving" : "Save changes"}
        </button>
      </div>

      {draft ? (
        <div className="grid gap-4 xl:grid-cols-2">
          <div className="space-y-4">
            <SupplierProfileBlock draft={draft} set={set} categories={data.categories} />
            <SupplierVisitBlock draft={draft} set={set} />
            <SupplierScoreBlock draft={draft} set={set} />
          </div>
          <div className="space-y-4">
            <SupplierFilmBlock draft={draft} set={set} />
            <SupplierAgreementBlock draft={draft} set={set} />
            <SupplierCommercialBlock draft={draft} set={set} defaultCommission={data.default_commission} />
            <SupplierNotes code={supplier.supplier_code} notes={data.notes} />
            <p className="text-label text-app-meta">
              {data.products.length} {data.products.length === 1 ? "product" : "products"} listed:{" "}
              {data.products.map((product) => product.name).join(", ") || "none yet"}.
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
}