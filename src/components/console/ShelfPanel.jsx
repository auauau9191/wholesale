import ShelfStrip, { SHELF_KEY, ShelfMark } from "@/components/console/ShelfStrip";

/** Units of each product to pick for today's requests. */
export default function ShelfPanel({ shelf }) {
  return (
    <section className="rounded-card border border-edge bg-sheet p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-lead font-medium">Today's shelf</h2>
        <p className="text-label text-app-meta">Units of each product to pick</p>
      </div>
      <ul className="mt-3 flex flex-wrap gap-x-3 gap-y-1.5">
        {SHELF_KEY.map(([kind, label]) => (
          <li key={kind} className="flex items-center gap-1.5 text-label text-app-soft">
            <ShelfMark kind={kind} />
            {label}
          </li>
        ))}
      </ul>
      {shelf.length ? (
        <ul className="mt-4 space-y-2.5">
          {shelf.map((row) => (
            <li key={row.product_id} className="grid grid-cols-[minmax(0,110px)_1fr] items-center gap-3">
              <span className="truncate text-body">{row.name}</span>
              <ShelfStrip marks={row.marks} />
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 text-body text-app-meta">Nothing to pick today.</p>
      )}
      <p className="mt-4 text-label text-app-meta">
        The master never leaves the shelf. Packing a request takes its own unit, not the first free one.
      </p>
    </section>
  );
}