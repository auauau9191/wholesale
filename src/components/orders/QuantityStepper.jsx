import { Minus, Plus } from "lucide-react";
import { formatQty, formatUsd } from "@/lib/format";

const STEP_BUTTON =
  "flex h-11 w-11 items-center justify-center rounded-control border border-control text-app-ink transition-transform duration-150 active:scale-[0.97] disabled:opacity-40";

/** −/+ one step at a time, never under the MOQ. */
export default function QuantityStepper({ quantity, moq, step, unitFob, disabled, onChange }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-lead font-medium">Quantity</p>
        <p className="tabular text-label text-app-meta">
          {unitFob != null ? `${formatUsd(unitFob)} a unit at this tier · ` : ""}MOQ {formatQty(moq)}
        </p>
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-label={`${formatQty(step)} fewer`}
          disabled={disabled || quantity - step < moq}
          onClick={() => onChange(quantity - step)}
          className={STEP_BUTTON}
        >
          <Minus className="h-4 w-4" aria-hidden="true" />
        </button>
        <p className="tabular min-w-[72px] text-center text-title font-medium" aria-live="polite">
          {formatQty(quantity)}
        </p>
        <button
          type="button"
          aria-label={`${formatQty(step)} more`}
          disabled={disabled}
          onClick={() => onChange(quantity + step)}
          className={STEP_BUTTON}
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}