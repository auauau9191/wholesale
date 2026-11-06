import DataBlock from "@/components/shell/DataBlock";
import { formatDate } from "@/lib/format";

const REASON = {
  join: "Joining sample",
  order_placed: "Bulk order sample",
  swap: "Swap",
  admin_adjustment: "Adjustment",
  sample_used: "Sample used",
  fee_refund: "Fee refund",
};

export default function CreditHistory({ credits, balance, loading }) {
  return (
    <section>
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="text-lead font-medium">Sample credits</h2>
        <p className="flex items-baseline gap-3">
          <span className="text-body text-app-meta">Credit balance</span>
          <span className="tabular text-title font-medium">{balance}</span>
        </p>
      </div>

      <div className="mt-4">
        {loading ? <DataBlock state="loading" /> : null}

        {!loading && !credits.length ? (
          <DataBlock
            title="No credits yet."
            note="Your joining sample appears here once we activate your account."
          />
        ) : null}

        {!loading && credits.length ? (
          <div className="rounded-card border border-edge px-5">
            {credits.map((entry) => (
              <div
                key={entry.id}
                className="flex items-baseline justify-between gap-6 border-t border-rule py-3 first:border-t-0"
              >
                <span className="min-w-0">
                  <span className="block text-body text-app-ink">
                    {REASON[entry.reason] ?? "Adjustment"}
                  </span>
                  <span className="mt-0.5 block text-body text-app-meta">
                    {formatDate(entry.created_date)}
                    {entry.note ? ` · ${entry.note}` : ""}
                  </span>
                </span>
                <span className="tabular shrink-0 text-body text-app-ink">
                  {entry.change > 0 ? `+${entry.change}` : entry.change}
                </span>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}