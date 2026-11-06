import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Block, secondaryButton, TextField } from "@/components/console/FormBits";
import { formatDate } from "@/lib/format";
import { createSpecRevision } from "@/services/adminService";

const blank = (next) => ({
  revision: next,
  materials: "",
  dimensions_mm: "",
  weight_g: null,
  colour_pantone: "",
  finish: "",
  tolerances: "",
  packaging: "",
  labelling: "",
  signed_date: "",
  document_url: "",
  status: "signed",
});

/** Revisions, and the one warning that matters: older units must be retired. */
export default function ProductRevisionBlock({ productId, product, revisions }) {
  const queryClient = useQueryClient();
  const nextCode = `R${Math.max(0, ...revisions.map((row) => Number(String(row.revision).replace(/\D/g, "")) || 0)) + 1}`;
  const [form, setForm] = useState(null);
  const [warning, setWarning] = useState(null);

  const create = useMutation({
    mutationFn: () => createSpecRevision({ data: { product_id: productId, ...form, weight_g: form.weight_g ?? undefined } }),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["product-editor", productId] });
      setForm(null);
      setWarning(result);
      toast(`Revision ${result.revision.revision} is now current.`);
    },
    onError: (error) => toast(error.message),
  });

  const set = (patch) => setForm((current) => ({ ...current, ...patch }));

  return (
    <Block
      title="Spec revisions"
      note="A new revision supersedes the old one and becomes the revision every order is locked to."
      action={
        <button type="button" onClick={() => setForm(form ? null : blank(nextCode))} className={secondaryButton}>
          {form ? "Cancel" : `New revision ${nextCode}`}
        </button>
      }
    >
      {warning ? (
        <div className="mb-4 rounded-card border border-pill-amber-ink/30 bg-pill-amber p-3">
          <p className="text-body font-medium text-pill-amber-ink">
            Revision {warning.revision.revision} is now current, replacing {warning.previous ?? "the draft"}.
          </p>
          <p className="mt-1 text-body text-pill-amber-ink">
            {warning.stale_units.length
              ? `${warning.stale_units.length} sample ${warning.stale_units.length === 1 ? "unit is" : "units are"} still on the old revision. Retire them so nobody approves an old sample.`
              : "No sample units are on the old revision."}
          </p>
          {warning.stale_units.length ? (
            <ul className="tabular mt-2 flex flex-wrap gap-x-3 gap-y-1 text-label text-pill-amber-ink">
              {warning.stale_units.map((unit) => (
                <li key={unit.unit_id}>
                  {unit.unit_id} · {unit.revision ?? "—"} · {unit.hub_code}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}

      {form ? (
        <div className="mb-4 rounded-card border border-edge p-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <TextField label="Revision" value={form.revision} onChange={(value) => set({ revision: value })} />
            <label className="block">
              <span className="text-label text-app-meta">Status</span>
              <select
                value={form.status}
                onChange={(event) => set({ status: event.target.value })}
                className="mt-1 min-h-[36px] w-full rounded-control border border-control bg-sheet px-2 text-body outline-none focus:border-app-ink"
              >
                <option value="signed">Signed</option>
                <option value="draft">Draft</option>
              </select>
            </label>
            <TextField label="Materials" value={form.materials} onChange={(value) => set({ materials: value })} />
            <TextField label="Dimensions, mm" value={form.dimensions_mm} onChange={(value) => set({ dimensions_mm: value })} />
            <TextField label="Weight, g" type="number" value={form.weight_g} onChange={(value) => set({ weight_g: value === "" ? null : Number(value) })} />
            <TextField label="Colour, Pantone" value={form.colour_pantone} onChange={(value) => set({ colour_pantone: value })} />
            <TextField label="Finish" value={form.finish} onChange={(value) => set({ finish: value })} />
            <TextField label="Tolerances" value={form.tolerances} onChange={(value) => set({ tolerances: value })} />
            <TextField label="Packaging" value={form.packaging} onChange={(value) => set({ packaging: value })} />
            <TextField label="Labelling" value={form.labelling} onChange={(value) => set({ labelling: value })} />
            <label className="block">
              <span className="text-label text-app-meta">Signed on</span>
              <input
                type="date"
                value={form.signed_date}
                onChange={(event) => set({ signed_date: event.target.value })}
                className="tabular mt-1 min-h-[36px] w-full rounded-control border border-control bg-sheet px-2.5 text-body outline-none focus:border-app-ink"
              />
            </label>
            <TextField label="Document URL" value={form.document_url} onChange={(value) => set({ document_url: value })} />
          </div>
          <button
            type="button"
            onClick={() => create.mutate()}
            disabled={!form.revision.trim() || create.isPending}
            className="mt-4 min-h-[36px] rounded-control border border-app-ink bg-sheet px-3 text-body font-medium disabled:opacity-40"
          >
            {create.isPending ? "Saving" : "Create revision"}
          </button>
        </div>
      ) : null}

      {revisions.length ? (
        <ul>
          {revisions.map((row) => (
            <li key={row.id} className="flex flex-wrap items-baseline justify-between gap-2 border-b border-rule py-2.5 last:border-b-0">
              <div>
                <p className="tabular text-body font-medium">
                  {row.revision}
                  {row.revision === product.current_spec_revision ? " · current" : ""}
                </p>
                <p className="text-label text-app-meta">
                  {[row.materials, row.dimensions_mm, row.tolerances].filter(Boolean).join(" · ") || "No details"}
                </p>
              </div>
              <p className="tabular text-label text-app-meta">
                {row.status}
                {row.signed_date ? ` · signed ${formatDate(row.signed_date)}` : ""}
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-body text-app-meta">No revisions yet.</p>
      )}
    </Block>
  );
}