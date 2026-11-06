export default function ReviewStep({ planName, planPrice, form, sampleFee, terms, onTerms, error }) {
  const rows = [
    ["Plan", `${planName} · ${planPrice}`],
    ["Business", form.business_name],
    ["ABN", form.abn],
    ["Mobile", form.mobile],
    ["Delivery", `${form.street}, ${form.suburb} ${form.state} ${form.postcode}`],
  ];

  return (
    <div className="mt-6 max-w-[640px]">
      <dl>
        {rows.map(([label, value]) => (
          <div key={label} className="flex items-baseline justify-between gap-6 py-3">
            <dt className="text-body text-ink-soft">{label}</dt>
            <dd className="text-right text-body text-ink">{value}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-6 bg-paper p-6">
        <h2 className="text-lead font-medium">How free samples work</h2>
        <ul className="mt-3 space-y-2 text-body text-ink-soft">
          <li>1 free sample per ABN, for life.</li>
          <li>2 more each time you place a bulk order.</li>
          <li>
            {sampleFee === null || sampleFee === undefined
              ? "A fee per sample otherwise, credited back if you order within 90 days."
              : `Otherwise A$${sampleFee} a sample, credited back if you order within 90 days.`}
          </li>
        </ul>
      </div>

      <label className="mt-6 flex min-h-[44px] cursor-pointer items-start gap-3">
        <input
          type="checkbox"
          checked={terms}
          onChange={(event) => onTerms(event.target.checked)}
          className="mt-[3px] h-4 w-4 shrink-0 rounded-none accent-ink"
        />
        <span className="text-body text-ink">
          I agree to the membership terms and the sample rules.
        </span>
      </label>

      {error ? (
        <p className="mt-4 max-w-[560px] text-body text-alert">
          {error || "We couldn't send your details. Try again."}
        </p>
      ) : null}
    </div>
  );
}