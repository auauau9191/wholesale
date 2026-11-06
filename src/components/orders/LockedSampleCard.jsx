import { Lock } from "lucide-react";
import { formatDate } from "@/lib/format";
import { unitShort } from "@/lib/orderStatus";

function Fact({ label, value }) {
  return (
    <div>
      <dt className="text-label text-app-meta">{label}</dt>
      <dd className="tabular mt-0.5 text-body text-app-ink">{value || "—"}</dd>
    </div>
  );
}

/** The order is locked to this unit, this spec and this colour. */
export default function LockedSampleCard({ lock }) {
  return (
    <section className="rounded-card border border-edge bg-sheet p-5">
      <p className="flex items-center gap-1.5 text-body font-medium text-data">
        <Lock className="h-4 w-4" aria-hidden="true" />
        Locked to your approved sample
      </p>
      <h2 className="mt-2 text-lead font-medium">
        {lock.product_name}
        {lock.colour ? ` · ${lock.colour}` : ""}
      </h2>
      <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3">
        <Fact label="Product · spec" value={`${lock.product_id}${lock.spec_revision ? `-${lock.spec_revision}` : ""}`} />
        <Fact
          label="Approved unit"
          value={`${unitShort(lock.unit_id)}${lock.approved_on ? ` · approved ${formatDate(lock.approved_on)}` : ""}`}
        />
        <Fact label="Tolerances" value={lock.tolerances} />
        <Fact label="Inspection" value="AQL 2.5 vs master sample" />
      </dl>
    </section>
  );
}