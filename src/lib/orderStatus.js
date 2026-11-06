const GREEN = "bg-pill-green text-pill-green-ink";
const AMBER = "bg-pill-amber text-pill-amber-ink";
const GREY = "bg-pill-grey text-pill-grey-ink";
const FAIL = "border border-alert bg-sheet text-alert";

/** Member-facing words and pill tone for each order status. */
export const ORDER_STATUS = {
  quote_requested: { label: "Quote requested", tone: GREY },
  deposit_pending: { label: "Deposit due", tone: AMBER },
  in_production: { label: "In production", tone: GREEN },
  inspection_booked: { label: "Inspection booked", tone: GREY },
  inspection_passed: { label: "Inspection passed", tone: GREEN },
  inspection_failed: { label: "Inspection failed", tone: FAIL },
  balance_pending: { label: "Balance due", tone: AMBER },
  shipped: { label: "Shipped", tone: GREEN },
  delivered: { label: "Delivered", tone: GREEN },
  cancelled: { label: "Cancelled", tone: GREY },
};

export const statusOf = (status) => ORDER_STATUS[status] ?? { label: status ?? "Open", tone: GREY };

export const unitShort = (unitId) => String(unitId ?? "").split("-").pop();