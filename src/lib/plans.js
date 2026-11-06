/**
 * Public plan copy, built from the AppSettings record so no price is ever
 * hard-coded in a page.
 */
export function buildPlans(settings) {
  if (!settings) return [];
  return [
    {
      name: "Starter quarter",
      price: `A$${settings.starter_quarter_price_aud}`,
      note: `First 3 months paid upfront, then A$${settings.monthly_price_aud} a month. Includes 1 free sample.`,
    },
    {
      name: "Annual",
      price: `A$${settings.annual_price_aud}`,
      note: "Two months free. Includes 1 free sample.",
    },
  ];
}

export function commissionPercent(settings) {
  if (!settings || typeof settings.supplier_commission_rate !== "number") return null;
  return Math.round(settings.supplier_commission_rate * 100);
}