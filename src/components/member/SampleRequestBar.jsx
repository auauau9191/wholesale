import { formatAudWhole, formatQty } from "@/lib/format";
import { HUB_CITY } from "@/services/sampleService";

function buttonLabel(eligibility, pending) {
  if (pending) return "Requesting your sample";
  if (eligibility?.eligible && eligibility.method === "credit") return "Request free sample · uses 1 credit";
  if (eligibility?.eligible) return `Request sample · ${formatAudWhole(eligibility.price_aud)}`;
  return "Request sample";
}

/** Sticky bar: what is on the shelf, and the button that starts a request. */
export default function SampleRequestBar({ freeUnits, eligibility, loading, pending, error, onRequest }) {
  const hub = eligibility?.hub_code ? HUB_CITY[eligibility.hub_code] : null;
  const reason = error || (!loading && eligibility && !eligibility.eligible ? eligibility.reason_if_not : null);

  return (
    <div className="sticky bottom-[60px] z-30 mt-8 rounded-card border border-edge bg-sheet px-4 py-3 md:bottom-2">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="max-w-[420px] text-body text-app-soft">
          <span className="tabular">{formatQty(freeUnits)}</span> sample units in our Australian hubs
        </p>
        <div className="flex flex-col items-end gap-1 text-right">
          <button
            type="button"
            onClick={onRequest}
            disabled={loading || pending || !eligibility?.eligible}
            className="min-h-[44px] rounded-control bg-app-ink px-4 text-body font-medium text-sheet transition-transform duration-150 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-40"
          >
            {buttonLabel(eligibility, pending)}
          </button>
          {loading ? <span className="h-[14px] w-[160px] rounded-full bg-rule" aria-hidden="true" /> : null}
          {reason ? <p className="max-w-[320px] text-label text-app-soft">{reason}</p> : null}
          {!reason && hub ? <p className="text-label text-app-meta">Ships from our {hub} hub</p> : null}
        </div>
      </div>
    </div>
  );
}