export default function PlanList({ plans = [] }) {
  return (
    <div className="grid gap-3 md:grid-cols-2 md:gap-4">
      {plans.map((plan) => (
        <div key={plan.name} className="bg-surface p-6 md:p-8">
          <div className="flex items-baseline justify-between gap-4">
            <h3 className="text-lead font-medium">{plan.name}</h3>
            <span className="tabular text-title font-medium">{plan.price}</span>
          </div>
          <p className="mt-4 text-body text-ink-soft">{plan.note}</p>
        </div>
      ))}
    </div>
  );
}