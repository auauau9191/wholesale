import { Lock } from "lucide-react";

/** Contacts stay locked until an order goes through us. */
export default function LockNotice() {
  return (
    <div className="flex gap-3 rounded-card bg-pill-amber px-4 py-4 text-pill-amber-ink">
      <Lock className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      <p className="text-body">
        Legal name and direct contacts unlock when you place an order through Wholesale System, so
        our inspection and spec lock protect you.
      </p>
    </div>
  );
}