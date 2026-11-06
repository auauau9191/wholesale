export const PLAN_LABEL = {
  starter_quarter: "Starter quarter",
  monthly: "Monthly",
  annual: "Annual",
};

/** A membership only opens the member pages while it is active and paid up. */
export function isPaidUp(paidUntil) {
  if (!paidUntil) return false;
  const today = new Date().toISOString().slice(0, 10);
  return String(paidUntil).slice(0, 10) >= today;
}

export function isMembershipActive(profile) {
  return Boolean(profile) && profile.status === "active" && isPaidUp(profile.paid_until);
}