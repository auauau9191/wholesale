import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

/** A fraud check: what was flagged on the member, then release the request. */
export default function ReviewDialog({ row, open, onOpenChange, pending, error, onConfirm }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-card">
        <DialogHeader>
          <DialogTitle className="text-lead font-medium">Review {row.request_no}</DialogTitle>
          <DialogDescription className="tabular text-body text-app-meta">
            {row.member} · {row.abn_masked}
          </DialogDescription>
        </DialogHeader>
        <div>
          <p className="text-body font-medium">Flagged on this member</p>
          {row.fraud_flags.length ? (
            <ul className="mt-2 space-y-1">
              {row.fraud_flags.map((flag) => (
                <li key={flag} className="text-body text-app-soft">{flag}</li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-body text-app-meta">No member flags left. The request was held for a check.</p>
          )}
        </div>
        <p className="text-body text-app-soft">Releasing clears the check. The request moves to packing unless it still waits on payment.</p>
        {error ? <p className="text-body text-alert">{error}</p> : null}
        <button
          type="button"
          onClick={() => onConfirm({})}
          disabled={pending}
          className="min-h-[44px] w-full rounded-control bg-app-ink px-4 text-body font-medium text-sheet transition-transform duration-150 active:scale-[0.97] disabled:opacity-40"
        >
          {pending ? "Saving" : "Checked, release request"}
        </button>
      </DialogContent>
    </Dialog>
  );
}