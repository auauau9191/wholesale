/** One printable label: who it goes to, and what and where it comes from. */
export default function DispatchLabel({ label }) {
  return (
    <article className="break-inside-avoid rounded-card border border-app-ink p-5 print:rounded-none">
      <p className="text-label text-app-meta">To</p>
      <p className="mt-1 text-lead font-medium">{label.name}</p>
      <p className="text-body">{label.street || "Street not given"}</p>
      <p className="text-body">{label.locality}</p>
      <div className="mt-4 grid grid-cols-2 gap-3 border-t border-control pt-3">
        <div>
          <p className="text-label text-app-meta">Request</p>
          <p className="tabular text-body font-medium">{label.request_no}</p>
        </div>
        <div>
          <p className="text-label text-app-meta">Unit</p>
          <p className="tabular text-body font-medium">{label.unit_id}</p>
        </div>
      </div>
      <p className="mt-3 text-label text-app-meta">
        From Wholesale System, {label.hub_name}
        {label.hub_city ? `, ${label.hub_city}` : ""}
      </p>
    </article>
  );
}