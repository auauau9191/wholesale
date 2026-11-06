/** Products at or under the reorder level on the shelf, emptiest first. */
export default function LowStockPanel({ low, level, wide = false }) {
  return (
    <section className="rounded-card border border-edge bg-sheet p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-lead font-medium">Low on samples</h2>
        <p className="tabular text-label text-app-meta">{level} or fewer on the shelf</p>
      </div>
      {low.length ? (
        <ul className={`mt-3 ${wide ? "md:grid md:grid-cols-2 md:gap-x-6" : ""}`}>
          {low.map((row) => (
            <li key={row.product_id} className="flex items-center justify-between gap-3 border-b border-rule py-2.5 last:border-b-0">
              <div className="min-w-0">
                <p className="truncate text-body">{row.name}</p>
                <p className="tabular text-label text-app-meta">{row.product_id}</p>
              </div>
              <p className={`tabular shrink-0 text-body ${row.left <= 1 ? "text-alert" : "text-app-soft"}`}>
                {row.left === 0 ? "None left" : `${row.left} left`}
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-body text-app-meta">Every product has enough on the shelf.</p>
      )}
    </section>
  );
}