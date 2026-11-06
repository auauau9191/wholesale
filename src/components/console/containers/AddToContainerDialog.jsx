import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { inputClass, primaryButton } from "@/components/console/FormBits";

const area = "mt-1 w-full rounded-control border border-control bg-sheet px-2.5 py-2 text-body outline-none focus:border-app-ink";

/** Units and orders go on by ID, one per line. */
export default function AddToContainerDialog({ container, open, onOpenChange, pending, error, onAdd }) {
  const [unitIds, setUnitIds] = useState("");
  const [orderNos, setOrderNos] = useState("");
  const empty = !unitIds.trim() && !orderNos.trim();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-card">
        <DialogHeader>
          <DialogTitle className="text-lead font-medium">Add to {container?.container_no}</DialogTitle>
          <DialogDescription className="text-body text-app-meta">
            One per line. Units are moved onto this container and its destination hub.
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            onAdd({ unit_ids: unitIds, order_nos: orderNos });
          }}
          className="space-y-3"
        >
          <label className="block">
            <span className="text-label text-app-meta">Sample unit IDs</span>
            <textarea
              value={unitIds}
              onChange={(event) => setUnitIds(event.target.value)}
              rows={3}
              placeholder="PC-CN014-0087-S07"
              className={`tabular ${area}`}
            />
          </label>
          <label className="block">
            <span className="text-label text-app-meta">Order numbers</span>
            <textarea
              value={orderNos}
              onChange={(event) => setOrderNos(event.target.value)}
              rows={2}
              placeholder="WS-0142"
              className={`tabular ${area}`}
            />
          </label>
          {error ? <p className="text-body text-alert">{error}</p> : null}
          <button type="submit" disabled={empty || pending} className={`w-full ${primaryButton}`}>
            {pending ? "Adding" : "Add to container"}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}