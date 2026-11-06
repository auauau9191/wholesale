import { useState } from "react";
import { Block, NumberField, secondaryButton, TextField, Toggle } from "@/components/console/FormBits";

/** A flags list typed as one per line, kept raw so a half-typed word isn't lost. */
function ListField({ label, value, onChange, hint }) {
  const [raw, setRaw] = useState((value ?? []).join("\n"));
  return (
    <label className="block">
      <span className="text-label text-app-meta">{label}</span>
      <textarea
        value={raw}
        rows={2}
        onChange={(event) => {
          setRaw(event.target.value);
          onChange(event.target.value.split("\n").map((item) => item.trim()).filter(Boolean));
        }}
        className="mt-1 w-full rounded-control border border-control bg-sheet px-2.5 py-2 text-body outline-none focus:border-app-ink"
      />
      {hint ? <span className="mt-1 block text-label text-app-meta">{hint}</span> : null}
    </label>
  );
}

/** Freight, duty, safety and the test reports that expire. */
export default function ProductComplianceBlock({ draft, set }) {
  const reports = draft.test_reports ?? [];
  const setReport = (index, patch) => set({ test_reports: reports.map((item, i) => (i === index ? { ...item, ...patch } : item)) });

  return (
    <Block title="Compliance and freight" note="Duty applies at the full rate unless the ChAFTA certificate exists.">
      <div className="grid gap-4 sm:grid-cols-2">
        <NumberField
          label="Freight per unit, A$"
          value={draft.freight_aud_per_unit_estimate}
          onChange={(value) => set({ freight_aud_per_unit_estimate: value })}
          step="0.01"
        />
        <TextField label="Incoterm and port" value={draft.incoterm_port} onChange={(value) => set({ incoterm_port: value })} placeholder="FOB Shenzhen" />
        <TextField label="HS code" value={draft.hs_code_indicative} onChange={(value) => set({ hs_code_indicative: value })} />
        <div className="self-end pb-1">
          <Toggle
            label="ChAFTA origin certificate"
            checked={draft.has_chafta_origin_cert}
            onChange={(value) => set({ has_chafta_origin_cert: value })}
          />
        </div>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <ListField label="Safety flags" value={draft.safety_flags} onChange={(value) => set({ safety_flags: value })} hint="One per line." />
        <ListField label="Biosecurity flags" value={draft.biosecurity_flags} onChange={(value) => set({ biosecurity_flags: value })} hint="One per line." />
      </div>

      <div className="mt-5 flex items-baseline justify-between border-t border-rule pt-4">
        <p className="text-body font-medium">Test reports</p>
        <button
          type="button"
          onClick={() => set({ test_reports: [...reports, { name: "", expires_on: "" }] })}
          className={secondaryButton}
        >
          Add report
        </button>
      </div>
      {reports.length ? (
        <ul className="mt-2 space-y-2">
          {reports.map((report, index) => (
            <li key={index} className="flex items-end gap-2">
              <label className="min-w-0 flex-1">
                <span className="text-label text-app-meta">Report</span>
                <input
                  value={report.name}
                  onChange={(event) => setReport(index, { name: event.target.value })}
                  className="mt-1 min-h-[36px] w-full rounded-control border border-control bg-sheet px-2.5 text-body outline-none focus:border-app-ink"
                />
              </label>
              <label className="w-[160px]">
                <span className="text-label text-app-meta">Expires</span>
                <input
                  type="date"
                  value={report.expires_on ?? ""}
                  onChange={(event) => setReport(index, { expires_on: event.target.value })}
                  className="tabular mt-1 min-h-[36px] w-full rounded-control border border-control bg-sheet px-2.5 text-body outline-none focus:border-app-ink"
                />
              </label>
              <button
                type="button"
                onClick={() => set({ test_reports: reports.filter((_, i) => i !== index) })}
                className="min-h-[36px] rounded-control px-2 text-body text-app-meta hover:text-alert"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 text-body text-app-meta">No test reports on file.</p>
      )}
    </Block>
  );
}