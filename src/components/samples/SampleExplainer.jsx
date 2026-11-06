/** How free samples unlock, from AppSettings. */
export default function SampleExplainer({ explainer }) {
  if (!explainer) return null;
  return (
    <section className="max-w-[560px]">
      <h2 className="text-lead font-medium">How free samples unlock</h2>
      <ul className="mt-2 space-y-1 text-body text-app-soft">
        <li>1 free sample when you join, once per ABN.</li>
        <li>
          <span className="tabular">{explainer.order_sample_credits}</span> more each time you place a bulk order.
        </li>
        <li>
          Otherwise <span className="tabular">A${explainer.sample_fee_aud}</span> per sample, credited back if you order it
          within <span className="tabular">{explainer.credit_back_days}</span> days.
        </li>
      </ul>
    </section>
  );
}