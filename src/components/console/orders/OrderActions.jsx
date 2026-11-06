import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { inputClass, primaryButton, secondaryButton } from "@/components/console/FormBits";
import { ORDER_ACTION_LABEL } from "@/lib/orderActionLabels";

const ROUTES = [
  ["via_BNE", "Via Brisbane"],
  ["via_SYD", "Via Sydney"],
  ["direct", "Direct to the member"],
];

/** The next step only. Two actions need an answer before they run. */
export default function OrderActions({ actions, pending, error, onAct }) {
  const [dialog, setDialog] = useState(null);
  const [reportUrl, setReportUrl] = useState("");
  const [note, setNote] = useState("");
  const [containerNo, setContainerNo] = useState("");
  const [route, setRoute] = useState("via_BNE");

  if (!actions.length) {
    return <p className="text-body text-app-meta">No next step. This order is closed.</p>;
  }

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {actions.map((action, index) => (
          <button
            key={action}
            type="button"
            disabled={pending}
            onClick={() => {
              if (action === "inspection_failed" || action === "shipped") setDialog(action);
              else onAct({ action });
            }}
            className={index === 0 ? primaryButton : secondaryButton}
          >
            {ORDER_ACTION_LABEL[action]}
          </button>
        ))}
      </div>
      {error ? <p className="mt-2 text-body text-alert">{error}</p> : null}

      <Dialog open={Boolean(dialog)} onOpenChange={(open) => !open && setDialog(null)}>
        <DialogContent className="rounded-card">
          <DialogHeader>
            <DialogTitle className="text-lead font-medium">{ORDER_ACTION_LABEL[dialog] ?? ""}</DialogTitle>
            <DialogDescription className="text-body text-app-meta">
              {dialog === "shipped"
                ? "The container number and the route the goods take to the member."
                : "The report link is kept on the order. A second failed inspection cancels it and refunds the deposit."}
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              if (dialog === "shipped") onAct({ action: "shipped", container_no: containerNo.trim(), delivery_route: route });
              else onAct({ action: "inspection_failed", report_url: reportUrl.trim(), note: note.trim() || undefined });
              setDialog(null);
            }}
            className="space-y-3"
          >
            {dialog === "shipped" ? (
              <>
                <label className="block">
                  <span className="text-label text-app-meta">Container number</span>
                  <input value={containerNo} onChange={(event) => setContainerNo(event.target.value)} className={`tabular ${inputClass}`} required />
                </label>
                <label className="block">
                  <span className="text-label text-app-meta">Delivery route</span>
                  <select value={route} onChange={(event) => setRoute(event.target.value)} className={inputClass}>
                    {ROUTES.map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </label>
              </>
            ) : (
              <>
                <label className="block">
                  <span className="text-label text-app-meta">Report link</span>
                  <input value={reportUrl} onChange={(event) => setReportUrl(event.target.value)} className={inputClass} required />
                </label>
                <label className="block">
                  <span className="text-label text-app-meta">What failed</span>
                  <input value={note} onChange={(event) => setNote(event.target.value)} className={inputClass} />
                </label>
              </>
            )}
            <button type="submit" disabled={pending} className={`w-full ${primaryButton}`}>
              {pending ? "Saving" : ORDER_ACTION_LABEL[dialog]}
            </button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}