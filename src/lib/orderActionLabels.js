/** The one next action for each status, and what it's called. Safe on both sides. */
export const ORDER_NEXT = {
  deposit_pending: ["deposit_received"],
  in_production: ["book_inspection"],
  inspection_booked: ["inspection_passed", "inspection_failed"],
  inspection_failed: ["book_inspection"],
  inspection_passed: ["balance_received"],
  balance_received: ["shipped"],
  shipped: ["delivered"],
};

/** The console translates this key; ORDER_ACTION_LABEL stays for the buyer app. */
export const actionKey = (action) => `order.action.${action}`;

export const ORDER_ACTION_LABEL = {
  deposit_received: "Deposit received",
  book_inspection: "Book inspection",
  inspection_passed: "Inspection passed",
  inspection_failed: "Inspection failed",
  balance_received: "Balance received",
  shipped: "Shipped",
  delivered: "Delivered",
};