const BARS = ["w-[70%]", "w-[52%]", "w-[84%]"];

/**
 * A block that always has its own empty, loading and error states. Loading is
 * flat grey bars at the size the real rows will take: no shimmer.
 */
export default function DataBlock({ state = "empty", title, note, action }) {
  if (state === "loading") {
    return (
      <div className="rounded-card border border-edge bg-sheet p-6" aria-busy="true">
        {BARS.map((width) => (
          <div key={width} className={`mb-3 h-[14px] rounded-full bg-rule last:mb-0 ${width}`} />
        ))}
      </div>
    );
  }

  if (state === "error") {
    return (
      <div className="rounded-card border border-edge bg-sheet p-6">
        <p className="text-lead font-medium text-alert">Couldn&apos;t load this.</p>
        <p className="mt-2 max-w-[520px] text-body text-app-meta">
          {note || "Try again in a moment."}
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-card border border-edge bg-sheet p-6 md:p-8">
      <p className="text-lead font-medium">{title}</p>
      {note ? <p className="mt-2 max-w-[560px] text-body text-app-meta">{note}</p> : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}