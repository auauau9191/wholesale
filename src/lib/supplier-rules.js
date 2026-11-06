/** The pipeline, its labels and the one gate that matters: going live. */
export const STAGES = ["screened", "visited", "filmed", "signed", "samples_in", "live"];

export const STAGE_LABEL = {
  screened: "Screened",
  visited: "Visited",
  filmed: "Filmed",
  signed: "Signed",
  samples_in: "Samples in",
  live: "Live",
  rejected: "Rejected",
};

/** The console translates this key; STAGE_LABEL above stays for anything unkeyed. */
export const stageKey = (stage) => `stage.${stage}`;

/** The six things checked on the visit. */
export const CHECKS = [
  "Business licence matches the trading name",
  "No forced or child labour on the floor",
  "Export licence covers the category",
  "Production lines match the price list",
  "Own quality control before packing",
  "Agreed to the visit and the film",
];

export const SCORE_FIELDS = [
  ["score_capability", "Capability"],
  ["score_quality", "Quality"],
  ["score_communication", "Communication"],
  ["score_compliance", "Compliance"],
  ["score_export", "Export record"],
];

export const listingFeeCurrent = (supplier, todayIso) =>
  Boolean(supplier.listing_fee_waived) ||
  (Boolean(supplier.listing_fee_paid_until) && String(supplier.listing_fee_paid_until).slice(0, 10) >= todayIso);

/** What still blocks this supplier from going live. Empty means it can. */
export function liveGaps(supplier, { feePaid, hasStock }) {
  const gaps = [];
  if (supplier.agreement_status !== "signed") gaps.push("Agreement is not signed.");
  if (!supplier.non_circumvention_signed) gaps.push("Non-circumvention is not signed.");
  const score = Number(supplier.verification_score) || 0;
  if (score < 70) gaps.push(`Verification score is ${score}, and live needs 70.`);
  if (!feePaid) gaps.push("The listing fee is not paid or waived.");
  if (!hasStock) gaps.push("No product of theirs has a sample in stock at a hub.");
  return gaps;
}

/** The scorecard total, 0-100, from the five 0-20 scores. */
export const scoreTotal = (supplier) =>
  SCORE_FIELDS.reduce((sum, [field]) => sum + Math.min(20, Math.max(0, Number(supplier[field]) || 0)), 0);

export const stageIndex = (stage) => STAGES.indexOf(stage);