import { Block, NumberField, TextField } from "@/components/console/FormBits";

const STATUSES = [
  ["draft", "Draft"],
  ["live", "Live"],
  ["sample_unavailable", "Sample unavailable"],
  ["retired", "Retired"],
];

const selectClass = "mt-1 min-h-[36px] w-full rounded-control border border-control bg-sheet px-2 text-body outline-none focus:border-app-ink";

/** The catalogue facts a member reads, plus the two things that decide where stock lives. */
export default function ProductDetailsBlock({ draft, set, suppliers, categories }) {
  return (
    <Block title="Details" note="Members see the name and the description; MOQ and lead time set the order.">
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField label="Name" value={draft.name} onChange={(value) => set({ name: value })} />
        <label className="block">
          <span className="text-label text-app-meta">Status</span>
          <select value={draft.status ?? "draft"} onChange={(event) => set({ status: event.target.value })} className={selectClass}>
            {STATUSES.map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="text-label text-app-meta">Supplier</span>
          <select value={draft.supplier_code ?? ""} onChange={(event) => set({ supplier_code: event.target.value })} className={selectClass}>
            {suppliers.map((item) => (
              <option key={item.code} value={item.code}>{item.label}</option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="text-label text-app-meta">Category</span>
          <select value={draft.category_code ?? ""} onChange={(event) => set({ category_code: event.target.value })} className={selectClass}>
            {categories.map((item) => (
              <option key={item.code} value={item.code}>{item.name}</option>
            ))}
          </select>
        </label>
        <NumberField label="MOQ" value={draft.moq} onChange={(value) => set({ moq: value })} min={1} />
        <NumberField label="Lead time, days" value={draft.lead_time_days} onChange={(value) => set({ lead_time_days: value })} min={0} />
        <label className="block">
          <span className="text-label text-app-meta">Master hub</span>
          <select value={draft.master_hub ?? "BNE"} onChange={(event) => set({ master_hub: event.target.value })} className={selectClass}>
            <option value="BNE">Brisbane</option>
            <option value="SYD">Sydney</option>
          </select>
        </label>
      </div>
      <label className="mt-4 block">
        <span className="text-label text-app-meta">Short description</span>
        <textarea
          value={draft.short_description ?? ""}
          onChange={(event) => set({ short_description: event.target.value })}
          rows={3}
          className="mt-1 w-full rounded-control border border-control bg-sheet px-2.5 py-2 text-body outline-none focus:border-app-ink"
        />
      </label>
    </Block>
  );
}