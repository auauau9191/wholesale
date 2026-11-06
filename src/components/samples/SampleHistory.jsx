import { formatDate } from "@/lib/format";

const RESULT = {
  approve: { label: "Approved", tone: "bg-pill-green text-pill-green-ink" },
  reject: { label: "Rejected", tone: "bg-pill-amber text-pill-amber-ink" },
  change: { label: "Change asked", tone: "bg-pill-grey text-pill-grey-ink" },
};

/** Past samples, newest first. */
export default function SampleHistory({ items }) {
  return (
    <section>
      <h2 className="text-lead font-medium">Past samples</h2>
      {items.length ? (
        <ul className="mt-3 rounded-card border border-edge bg-sheet">
          {items.map((item) => {
            const result = RESULT[item.decision] ?? { label: item.status === "cancelled" ? "Cancelled" : "Open", tone: "bg-pill-grey text-pill-grey-ink" };
            return (
              <li key={item.id} className="flex min-h-[56px] items-center justify-between gap-3 border-b border-rule px-4 py-2.5 last:border-b-0">
                <div className="min-w-0">
                  <p className="truncate text-body text-app-ink">
                    {item.product_name}
                    {item.colour ? ` · ${item.colour}` : ""}
                  </p>
                  <p className="tabular text-label text-app-meta">
                    {item.request_no} · {formatDate(item.requested_on)}
                  </p>
                </div>
                <span className={`shrink-0 rounded-full px-2 py-0.5 text-label ${result.tone}`}>{result.label}</span>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="mt-2 text-body text-app-meta">Samples you've decided on appear here.</p>
      )}
    </section>
  );
}