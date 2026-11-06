import { formatAudWhole } from "@/lib/format";

export const paidWithLabel = (row) =>
  ({
    join_credit: "Join credit",
    order_credit: "Order credit",
    swap: "Swap",
    paid_fee: `Paid ${formatAudWhole(row.fee_aud)}`,
  })[row.paid_with] ?? "—";

const GREEN = "bg-pill-green text-pill-green-ink";
const AMBER = "bg-pill-amber text-pill-amber-ink";
const GREY = "bg-pill-grey text-pill-grey-ink";

/** The console translates these keys for a request's status chip and action. */
export const statusKey = (row) =>
  row.bucket === "overdue"
    ? "request.status.overdue"
    : {
        requested: "request.status.to_pack",
        on_hold: "request.status.on_hold",
        ready_to_dispatch: "request.status.packed",
        dispatched: "request.status.in_transit",
        delivered: "request.status.deciding",
      }[row.status] ?? null;

export const actionKey = (action) => `request.action.${action}`;

export function statusChip(row) {
  if (row.bucket === "overdue") return { label: "Decision overdue", tone: AMBER };
  return (
    {
      requested: { label: "To pack", tone: GREY },
      on_hold: { label: "On hold", tone: AMBER },
      ready_to_dispatch: { label: "Packed", tone: GREEN },
      dispatched: { label: "In transit", tone: GREY },
      delivered: { label: "Deciding", tone: GREY },
    }[row.status] ?? { label: row.status, tone: GREY }
  );
}

export const ACTION_LABEL = {
  confirm_payment: "Confirm payment",
  review: "Review",
  mark_ready: "Mark ready",
  mark_dispatched: "Mark dispatched",
  mark_delivered: "Mark delivered",
  send_reminder: "Send reminder",
};

/** The count cards, in order; each one filters the list. */
export const QUEUE_FILTERS = [
  { key: "awaiting", label: "Awaiting dispatch", list: "To send today" },
  { key: "on_hold", label: "On hold", list: "On hold" },
  { key: "in_transit", label: "In transit", list: "In transit" },
  { key: "deciding", label: "Waiting on a decision", list: "Waiting on a decision" },
  { key: "overdue", label: "Decisions overdue", list: "Decisions overdue", amber: true },
  { key: "low", label: "Products low on samples", list: "Low on samples" },
];

/** What sits under the status: the request's own flags and the member's fraud flags. */
export const checksOf = (row) => [...row.flags, ...row.fraud_flags.map((flag) => `member: ${flag}`)];

export function dueText(row) {
  if (row.bucket === "deciding" || row.bucket === "overdue") return row.decision_due;
  if (row.bucket === "in_transit") return null;
  return row.due_out;
}