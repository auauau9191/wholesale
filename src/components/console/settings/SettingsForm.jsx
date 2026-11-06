import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { primaryButton } from "@/components/console/FormBits";
import { saveSettings } from "@/services/adminService";

const GROUPS = [
  {
    title: "Membership prices",
    note: "What a member pays. The starter quarter is paid up front, then monthly or annual.",
    fields: [
      ["starter_quarter_price_aud", "Starter quarter, A$"],
      ["monthly_price_aud", "Monthly, A$"],
      ["annual_price_aud", "Annual, A$"],
    ],
  },
  {
    title: "Order maths",
    note: "Used on every quote and order. Rates are shares, shown as percentages.",
    fields: [
      ["fx_usd_to_aud", "US$ to A$ rate", { step: 0.01 }],
      ["supplier_commission_rate", "Supplier commission", { percent: true }],
      ["buyer_service_fee_rate", "Member service fee", { percent: true }],
      ["deposit_rate", "Deposit share", { percent: true }],
      ["inspection_fee_aud", "Inspection, A$"],
      ["broker_fee_aud", "Broker per container, A$"],
      ["default_duty_rate_no_origin_cert", "Duty without ChAFTA", { percent: true }],
      ["gst_rate", "GST", { percent: true }],
    ],
  },
  {
    title: "Suppliers",
    note: "The listing fee is annual and charged in US$. The clause runs from the agreement.",
    fields: [
      ["supplier_listing_fee_usd", "Listing fee, US$"],
      ["non_circumvention_months", "Non-circumvention, months"],
    ],
  },
  {
    title: "Samples",
    note: "The fee, the windows and the credits a member gets.",
    fields: [
      ["sample_fee_aud", "Sample fee, A$"],
      ["decision_days", "Days to decide", { max: 365 }],
      ["dispatch_business_days", "Dispatch promise, business days", { max: 60 }],
      ["sample_reorder_level", "Reorder level", { max: 1000 }],
      ["order_sample_credits", "Credits per bulk order", { max: 50 }],
      ["swap_credit_days", "Swap credit, days", { max: 365 }],
      ["sample_fee_credit_back_days", "Fee credited back within, days", { max: 365 }],
    ],
  },
];

/** Every configurable number, in the groups they're used in. */
export default function SettingsForm({ settings }) {
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState(Object.fromEntries(GROUPS.flatMap((group) => group.fields.map(([key]) => [key, settings[key] ?? 0]))));

  const save = useMutation({
    mutationFn: () => saveSettings({ id: settings.id, patch: draft }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-settings"] });
      queryClient.invalidateQueries({ queryKey: ["appSettings"] });
      toast("Settings saved.");
    },
    onError: (error) => toast(error.message),
  });

  return (
    <div className="space-y-4">
      {GROUPS.map((group) => (
        <section key={group.title} className="rounded-card border border-edge bg-sheet p-5">
          <h2 className="text-lead font-medium">{group.title}</h2>
          <p className="mt-1 max-w-[600px] text-body text-app-meta">{group.note}</p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {group.fields.map(([key, label, options = {}]) => {
              const percent = Boolean(options.percent);
              const value = percent ? Math.round((draft[key] ?? 0) * 10000) / 100 : draft[key];
              return (
                <label key={key} className="block">
                  <span className="text-label text-app-meta">{label}</span>
                  <input
                    type="number"
                    min={0}
                    step={options.step ?? (percent ? 0.5 : 1)}
                    max={options.max ?? (percent ? 100 : undefined)}
                    value={value ?? ""}
                    onChange={(event) => {
                      const next = event.target.value === "" ? 0 : Number(event.target.value);
                      setDraft((current) => ({ ...current, [key]: percent ? next / 100 : next }));
                    }}
                    className="tabular mt-1 min-h-[36px] w-full rounded-control border border-control bg-sheet px-2.5 text-body outline-none focus:border-app-ink"
                  />
                </label>
              );
            })}
          </div>
        </section>
      ))}

      <div className="flex flex-wrap items-center gap-3">
        <button type="button" onClick={() => save.mutate()} disabled={save.isPending} className={primaryButton}>
          {save.isPending ? "Saving" : "Save settings"}
        </button>
        <p className="text-label text-app-meta">New quotes and orders use these numbers immediately.</p>
      </div>
    </div>
  );
}