import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { inputClass, primaryButton } from "@/components/console/FormBits";
import { formatAud } from "@/lib/format";

/** Money moves outside the app; here we record that it left. */
export default function MarkSentDialog({ payout, open, onOpenChange, pending, error, onSent }) {
  const [ref, setRef] = useState("");
  const [date, setDate] = useState(payout?.sent_on ?? new Date().toISOString().slice(0, 10));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-card">
        <DialogHeader>
          <DialogTitle className="text-lead font-medium">Mark {payout?.payout_no} sent</DialogTitle>
          <DialogDescription className="tabular text-body text-app-meta">
            {payout ? `${payout.supplier} · ${payout.order_no} · ${formatAud(payout.net_aud)} · ${payout.currency}` : ""}
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            onSent({ provider_ref: ref.trim(), sent_on: date });
          }}
          className="space-y-3"
        >
          <label className="block">
            <span className="text-label text-app-meta">Provider reference</span>
            <input value={ref} onChange={(event) => setRef(event.target.value)} className={`tabular ${inputClass}`} required autoFocus />
          </label>
          <label className="block">
            <span className="text-label text-app-meta">Sent on</span>
            <input type="date" value={date} onChange={(event) => setDate(event.target.value)} className={`tabular ${inputClass}`} required />
          </label>
          {error ? <p className="text-body text-alert">{error}</p> : null}
          <button type="submit" disabled={!ref.trim() || pending} className={`w-full ${primaryButton}`}>
            {pending ? "Saving" : "Mark sent"}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}