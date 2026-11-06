import { Link } from "@tanstack/react-router";

/** One factory on the board: who, where, how it scored and what blocks it. */
export default function PipelineCard({ row, dragging }) {
  return (
    <article
      className={[
        "rounded-card border bg-sheet p-3",
        dragging ? "border-data" : "border-edge",
      ].join(" ")}
    >
      <Link
        to="/admin/suppliers/$supplierCode"
        params={{ supplierCode: row.supplier_code }}
        className="block text-body font-medium hover:underline"
      >
        {row.headline}
      </Link>
      <p className="tabular mt-0.5 text-label text-app-meta">
        {row.supplier_code}
        {row.place ? ` · ${row.place}` : ""}
      </p>
      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        <span className="tabular rounded-full bg-pill-grey px-2 py-0.5 text-label text-pill-grey-ink">
          {row.verification_score}/100
        </span>
        {row.category_codes.slice(0, 3).map((code) => (
          <span key={code} className="tabular rounded-full border border-control px-2 py-0.5 text-label text-app-meta">
            {code}
          </span>
        ))}
      </div>
      {row.gaps.length ? (
        <p className="mt-2 text-label text-pill-amber-ink">
          {row.gaps.length} {row.gaps.length === 1 ? "thing" : "things"} missing for live
        </p>
      ) : row.pipeline_stage !== "live" ? (
        <p className="mt-2 text-label text-app-meta">Ready for live</p>
      ) : null}
    </article>
  );
}