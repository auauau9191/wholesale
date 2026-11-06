import { formatDate } from "@/lib/format";
import { statusOf } from "@/lib/orderStatus";

/** Every step the order has taken, oldest first. */
export default function OrderTimeline({ entries }) {
  const list = entries ?? [];
  return (
    <section className="rounded-card border border-edge bg-sheet p-5">
      <h2 className="text-lead font-medium">Timeline</h2>
      {list.length ? (
        <ol className="mt-4">
          {list.map((entry, index) => {
            const latest = index === list.length - 1;
            return (
              <li key={`${entry.status}-${entry.at}`} className="relative flex gap-3 pb-4 last:pb-0">
                {!latest ? <span className="absolute left-[6px] top-[16px] h-full w-[2px] bg-data" aria-hidden="true" /> : null}
                <span
                  className={`relative mt-[3px] h-[14px] w-[14px] shrink-0 rounded-full border-2 border-data ${latest ? "bg-sheet" : "bg-data"}`}
                  aria-hidden="true"
                />
                <div>
                  <p className={`text-body ${latest ? "font-medium" : ""}`}>{statusOf(entry.status).label}</p>
                  <p className="tabular text-label text-app-meta">
                    {formatDate(entry.at)}
                    {entry.note ? ` · ${entry.note}` : ""}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
      ) : (
        <p className="mt-2 text-body text-app-meta">Each production step appears here.</p>
      )}
    </section>
  );
}