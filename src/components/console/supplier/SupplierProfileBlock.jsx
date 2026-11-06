import { Block, NumberField, TextField } from "@/components/console/FormBits";

const TYPES = [
  ["factory", "Factory"],
  ["trading_company", "Trading company"],
];

/** Who they are, where they are, and what only staff may see. */
export default function SupplierProfileBlock({ draft, set, categories }) {
  const toggleCategory = (code) => {
    const list = draft.category_codes ?? [];
    set({ category_codes: list.includes(code) ? list.filter((item) => item !== code) : [...list, code] });
  };

  return (
    <Block title="Profile" note="What members see about the factory, and the contact record only staff can read.">
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField label="Headline" value={draft.headline} onChange={(value) => set({ headline: value })} />
        <label className="block">
          <span className="text-label text-app-meta">Type</span>
          <select
            value={draft.supplier_type ?? "factory"}
            onChange={(event) => set({ supplier_type: event.target.value })}
            className="mt-1 min-h-[36px] w-full rounded-control border border-control bg-sheet px-2 text-body outline-none focus:border-app-ink"
          >
            {TYPES.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <TextField label="Province" value={draft.province} onChange={(value) => set({ province: value })} />
        <TextField label="City" value={draft.city} onChange={(value) => set({ city: value })} />
        <NumberField
          label="Exporting since"
          value={draft.exporting_since_year}
          onChange={(value) => set({ exporting_since_year: value })}
          min={1900}
          max={2100}
        />
        <NumberField label="Staff" value={draft.staff_count} onChange={(value) => set({ staff_count: value })} min={0} />
        <TextField
          label="Production lines"
          value={draft.production_lines}
          onChange={(value) => set({ production_lines: value })}
        />
      </div>

      <p className="mt-5 text-label text-app-meta">Categories</p>
      <div className="mt-1.5 flex flex-wrap gap-1.5">
        {categories.map((item) => {
          const on = (draft.category_codes ?? []).includes(item.code);
          return (
            <button
              key={item.code}
              type="button"
              onClick={() => toggleCategory(item.code)}
              aria-pressed={on}
              className={[
                "tabular min-h-[32px] rounded-control border px-2.5 text-label",
                on ? "border-data bg-pill-green text-pill-green-ink" : "border-control text-app-soft",
              ].join(" ")}
            >
              {item.name}
            </button>
          );
        })}
      </div>

      <div className="mt-6 border-t border-rule pt-4">
        <p className="text-body font-medium">Admin only</p>
        <p className="mt-1 text-label text-app-meta">Legal name and contacts never reach a member before they order.</p>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <TextField label="Legal name" value={draft.legal_name} onChange={(value) => set({ legal_name: value })} />
          <TextField label="Contact name" value={draft.contact_name} onChange={(value) => set({ contact_name: value })} />
          <TextField label="Contact email" type="email" value={draft.contact_email} onChange={(value) => set({ contact_email: value })} />
          <TextField label="WeChat" value={draft.contact_wechat} onChange={(value) => set({ contact_wechat: value })} />
        </div>
        <label className="mt-4 block">
          <span className="text-label text-app-meta">Internal notes</span>
          <textarea
            value={draft.internal_notes ?? ""}
            onChange={(event) => set({ internal_notes: event.target.value })}
            rows={3}
            className="mt-1 w-full rounded-control border border-control bg-sheet px-2.5 py-2 text-body outline-none focus:border-app-ink"
          />
        </label>
      </div>
    </Block>
  );
}