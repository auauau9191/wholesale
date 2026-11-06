import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const FIELD = "mt-1 h-9 w-full rounded-control border border-control bg-sheet px-2.5 text-body outline-none focus:border-app-ink";

/** Carrier and tracking number are required to mark a sample dispatched. */
export default function DispatchDialog({ row, open, onOpenChange, pending, error, onConfirm }) {
  const [carrier, setCarrier] = useState("Australia Post");
  const [tracking, setTracking] = useState("");
  const ready = carrier.trim() && tracking.trim();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-card">
        <DialogHeader>
          <DialogTitle className="text-lead font-medium">Mark {row.request_no} dispatched</DialogTitle>
          <DialogDescription className="tabular text-body text-app-meta">
            {row.member} · {row.unit_id}
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            if (ready) onConfirm({ carrier: carrier.trim(), tracking_number: tracking.trim() });
          }}
          className="space-y-4"
        >
          <label className="block text-body">
            Carrier
            <input value={carrier} onChange={(event) => setCarrier(event.target.value)} className={FIELD} required />
          </label>
          <label className="block text-body">
            Tracking number
            <input value={tracking} onChange={(event) => setTracking(event.target.value)} className={`tabular ${FIELD}`} required autoFocus />
          </label>
          {error ? <p className="text-body text-alert">{error}</p> : null}
          <button
            type="submit"
            disabled={!ready || pending}
            className="min-h-[44px] w-full rounded-control bg-app-ink px-4 text-body font-medium text-sheet transition-transform duration-150 active:scale-[0.97] disabled:opacity-40"
          >
            {pending ? "Saving" : "Mark dispatched"}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}