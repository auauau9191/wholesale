import { Block, NumberField, Toggle } from "@/components/console/FormBits";

const CURRENCIES = ["CNY", "USD"];
const METHODS = [
  ["airwallex", "Airwallex"],
  ["bank_wire", "Bank wire"],
];

/** What the supplier pays us, and how we pay them. */
export default function SupplierCommercialBlock({ draft, set, defaultCommission }) {
  const percent = draft.commission_rate === null || draft.commission_rate === undefined ? "" : Math.round(draft.commission_rate * 10000) / 100;

  return (
    <Block title="Commercial" note="Commission is withheld from the balance payout. The listing fee is annual.">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-label text-app-meta">Commission rate, %</span>
          <input
            type="number"
            min={0}
            max={100}
            step={0.5}
            value={percent}
            placeholder={`${Math.round((defaultCommission ?? 0) * 1000) / 10} (default)`}
            onChange={(event) =>
              set({ commission_rate: event.target.value === "" ? null : Number(event.target.value) / 100 })
            }
            className="tabular mt-1 min-h-[36px] w-full rounded-control border border-control bg-sheet px-2.5 text-body outline-none focus:border-app-ink"
          />
          <span className="mt-1 block text-label text-app-meta">Empty uses the default rate.</span>
        </label>
        <label className="block">
          <span className="text-label text-app-meta">Listing fee paid until</span>
          <input
            type="date"
            value={draft.listing_fee_paid_until ?? ""}
            onChange={(event) => set({ listing_fee_paid_until: event.target.value })}
            className="tabular mt-1 min-h-[36px] w-full rounded-control border border-control bg-sheet px-2.5 text-body outline-none focus:border-app-ink"
          />
        </label>
      </div>
      <div className="mt-3">
        <Toggle
          label="Listing fee waived"
          checked={draft.listing_fee_waived}
          onChange={(value) => set({ listing_fee_waived: value })}
        />
      </div>

      <div className="mt-5 border-t border-rule pt-4">
        <p className="text-body font-medium">Payout</p>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="text-label text-app-meta">Currency</span>
            <select
              value={draft.payout_currency ?? "USD"}
              onChange={(event) => set({ payout_currency: event.target.value })}
              className="mt-1 min-h-[36px] w-full rounded-control border border-control bg-sheet px-2 text-body outline-none focus:border-app-ink"
            >
              {CURRENCIES.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-label text-app-meta">Method</span>
            <select
              value={draft.payout_method ?? "airwallex"}
              onChange={(event) => set({ payout_method: event.target.value })}
              className="mt-1 min-h-[36px] w-full rounded-control border border-control bg-sheet px-2 text-body outline-none focus:border-app-ink"
            >
              {METHODS.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="mt-4">
          <label className="block">
            <span className="text-label text-app-meta">Account reference</span>
            <input
              value={draft.payout_account_ref ?? ""}
              onChange={(event) => set({ payout_account_ref: event.target.value })}
              className="tabular mt-1 min-h-[36px] w-full rounded-control border border-control bg-sheet px-2.5 text-body outline-none focus:border-app-ink"
            />
          </label>
        </div>
      </div>
    </Block>
  );
}