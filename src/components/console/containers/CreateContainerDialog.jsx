import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { inputClass, primaryButton } from "@/components/console/FormBits";

const KINDS = [
  ["sample_consolidation", "Sample consolidation"],
  ["order_lcl", "Order, LCL"],
  ["order_fcl", "Order, FCL"],
];

const today = () => new Date().toISOString().slice(0, 10);

export default function CreateContainerDialog({ open, onOpenChange, pending, error, onCreate }) {
  const [form, setForm] = useState({
    kind: "sample_consolidation",
    origin_port: "Shenzhen",
    destination_hub: "BNE",
    etd: today(),
    eta: today(),
  });
  const set = (patch) => setForm((current) => ({ ...current, ...patch }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-card">
        <DialogHeader>
          <DialogTitle className="text-lead font-medium">New container</DialogTitle>
          <DialogDescription className="text-body text-app-meta">
            The number is generated from the sailing month.
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            onCreate(form);
          }}
          className="space-y-3"
        >
          <label className="block">
            <span className="text-label text-app-meta">Kind</span>
            <select value={form.kind} onChange={(event) => set({ kind: event.target.value })} className={inputClass}>
              {KINDS.map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-label text-app-meta">Origin port</span>
            <input value={form.origin_port} onChange={(event) => set({ origin_port: event.target.value })} className={inputClass} required />
          </label>
          <label className="block">
            <span className="text-label text-app-meta">Destination hub</span>
            <select value={form.destination_hub} onChange={(event) => set({ destination_hub: event.target.value })} className={inputClass}>
              <option value="BNE">Brisbane</option>
              <option value="SYD">Sydney</option>
            </select>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="text-label text-app-meta">ETD</span>
              <input type="date" value={form.etd} onChange={(event) => set({ etd: event.target.value })} className={`tabular ${inputClass}`} required />
            </label>
            <label className="block">
              <span className="text-label text-app-meta">ETA</span>
              <input type="date" value={form.eta} onChange={(event) => set({ eta: event.target.value })} className={`tabular ${inputClass}`} required />
            </label>
          </div>
          {error ? <p className="text-body text-alert">{error}</p> : null}
          <button type="submit" disabled={pending} className={`w-full ${primaryButton}`}>
            {pending ? "Creating" : "Create container"}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}