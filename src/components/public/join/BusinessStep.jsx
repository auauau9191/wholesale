import { isValidAbn } from "@/lib/abn";

const STATES = ["NSW", "VIC", "QLD", "WA", "SA", "TAS", "ACT", "NT"];

const INPUT =
  "mt-2 min-h-[44px] w-full rounded-none bg-paper px-4 text-body text-ink outline-none placeholder:text-ink-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-ink";

export default function BusinessStep({ form, onChange }) {
  const abnComplete = form.abn.length >= 11;
  const abnValid = isValidAbn(form.abn);

  return (
    <div className="mt-6 grid gap-x-6 gap-y-5 md:grid-cols-2">
      <label className="block md:col-span-2">
        <span className="text-body text-ink">Business name</span>
        <input
          type="text"
          autoComplete="organization"
          value={form.business_name}
          onChange={(event) => onChange("business_name", event.target.value)}
          className={INPUT}
        />
      </label>

      <div className="md:col-span-2">
        <label className="block">
          <span className="text-body text-ink">ABN</span>
          <input
            type="text"
            inputMode="numeric"
            autoComplete="off"
            placeholder="11-digit ABN"
            maxLength={11}
            value={form.abn}
            onChange={(event) => onChange("abn", event.target.value.replace(/\D/g, ""))}
            className={INPUT}
          />
        </label>
        {abnComplete && abnValid ? (
          <p className="mt-2 text-body text-data">ABN format valid</p>
        ) : null}
        {abnComplete && !abnValid ? (
          <p className="mt-2 text-body text-alert">
            That ABN fails the checksum. Check the 11 digits.
          </p>
        ) : null}
        <p className="mt-2 text-body text-ink-soft">
          Checked against ABN Lookup. One free sample per ABN, for life.
        </p>
      </div>

      <label className="block">
        <span className="text-body text-ink">Mobile</span>
        <input
          type="tel"
          autoComplete="tel"
          value={form.mobile}
          onChange={(event) => onChange("mobile", event.target.value)}
          className={INPUT}
        />
      </label>

      <label className="block">
        <span className="text-body text-ink">Postcode</span>
        <input
          type="text"
          inputMode="numeric"
          autoComplete="postal-code"
          maxLength={4}
          value={form.postcode}
          onChange={(event) => onChange("postcode", event.target.value.replace(/\D/g, ""))}
          className={INPUT}
        />
      </label>

      <label className="block md:col-span-2">
        <span className="text-body text-ink">Street address</span>
        <input
          type="text"
          autoComplete="street-address"
          value={form.street}
          onChange={(event) => onChange("street", event.target.value)}
          className={INPUT}
        />
      </label>

      <label className="block">
        <span className="text-body text-ink">Suburb</span>
        <input
          type="text"
          value={form.suburb}
          onChange={(event) => onChange("suburb", event.target.value)}
          className={INPUT}
        />
      </label>

      <label className="block">
        <span className="text-body text-ink">State</span>
        <select
          value={form.state}
          onChange={(event) => onChange("state", event.target.value)}
          className={INPUT}
        >
          {STATES.map((state) => (
            <option key={state} value={state}>
              {state}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}