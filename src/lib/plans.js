/**
 * Public plan copy, built from the AppSettings record so no price is ever
 * hard-coded in a page.
 */
export function buildPlans(settings) {
  if (!settings) return [];
  return [
    {
      key: "starter_quarter",
      name: "Starter quarter",
      price: `A$${settings.starter_quarter_price_aud}`,
      note: `First 3 months paid upfront, then A$${settings.monthly_price_aud} a month. Includes 1 free sample.`,
    },
    {
      key: "annual",
      name: "Annual",
      price: `A$${settings.annual_price_aud}`,
      note: "Two months free. Includes 1 free sample.",
    },
  ];
}

/** The price of one plan, straight from AppSettings. */
export function planPriceAud(settings, plan) {
  if (!settings) return null;
  if (plan === "annual") return settings.annual_price_aud;
  if (plan === "monthly") return settings.monthly_price_aud;
  return settings.starter_quarter_price_aud;
}

export function commissionPercent(settings) {
  if (!settings || typeof settings.supplier_commission_rate !== "number") return null;
  return Math.round(settings.supplier_commission_rate * 100);
}