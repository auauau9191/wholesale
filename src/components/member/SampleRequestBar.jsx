import { toast } from "sonner";
import { formatQty } from "@/lib/format";

/** Sticky bar: what is on the shelf, and the button that starts a request. */
export default function SampleRequestBar({ freeUnits, dispatchDays }) {
  return (
    <div className="sticky bottom-[60px] z-30 mt-8 rounded-card border border-edge bg-sheet px-4 py-3 md:bottom-2">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="max-w-[420px] text-body text-app-soft">
          <span className="tabular">{formatQty(freeUnits)}</span> sample units in our Australian
          warehouse
          {dispatchDays ? ` · ships in ${dispatchDays} business days` : ""}
        </p>
        <button
          type="button"
          onClick={() => toast("Sample requests open in the next step.")}
          className="min-h-[44px] rounded-control bg-app-ink px-4 text-body font-medium text-sheet transition-transform duration-150 active:scale-[0.97]"
        >
          Request free sample
        </button>
      </div>
    </div>
  );
}