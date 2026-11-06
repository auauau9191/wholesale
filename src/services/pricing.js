/**
 * The landed-cost formula, in one place and free of any data access.
 * Everything the product page shows is summed from these lines.
 */

/** The factory price tier that applies at a quantity. */
export function tierForQuantity(product, quantity) {
  const tiers = [...(product?.price_tiers ?? [])].sort((a, b) => a.min_qty - b.min_qty);
  if (tiers.length === 0) return null;
  const qty = Number(quantity) || 0;
  const exact = tiers.find(
    (tier) => qty >= tier.min_qty && (tier.max_qty == null || qty <= tier.max_qty)
  );
  if (exact) return exact;
  return qty < tiers[0].min_qty ? tiers[0] : tiers[tiers.length - 1];
}

/**
 * unit_fob  = tier fob at this quantity
 * goods     = unit_fob × fx
 * freight   = per-unit freight estimate
 * duty      = 0 with a ChAFTA certificate, otherwise goods × default rate
 * broker    = broker fee ÷ quantity
 * gst       = gst rate × (goods + freight + duty)
 * landed    = goods + freight + duty + broker + gst
 */
export function landedCost(product, quantity, settings) {
  const qty = Math.max(1, Math.round(Number(quantity) || 0));
  const tier = tierForQuantity(product, qty);
  const unitFob = Number(tier?.fob_usd) || 0;
  const fx = Number(settings?.fx_usd_to_aud) || 0;
  const goods = unitFob * fx;
  const freight = Number(product?.freight_aud_per_unit_estimate) || 0;
  const dutyRate = product?.has_chafta_origin_cert
    ? 0
    : Number(settings?.default_duty_rate_no_origin_cert) || 0;
  const duty = goods * dutyRate;
  const broker = (Number(settings?.broker_fee_aud) || 0) / qty;
  const gstRate = Number(settings?.gst_rate) || 0;
  const gst = gstRate * (goods + freight + duty);
  const landed = goods + freight + duty + broker + gst;

  return {
    quantity: qty,
    tier,
    unitFob,
    goods,
    freight,
    dutyRate,
    duty,
    broker,
    gstRate,
    gst,
    landed,
    orderTotal: landed * qty,
  };
}

/** The quantities worth offering as chips: the MOQ, 2,000 and 5,000. */
export function quantityChips(product) {
  const moq = Number(product?.moq) || 0;
  const options = [moq, 2000, 5000].filter((qty) => qty > 0 && qty >= moq);
  return [...new Set(options)].sort((a, b) => a - b);
}