import { tierForQuantity } from "@/services/pricing";

const round2 = (value) => Math.round((Number(value) || 0) * 100) / 100;

/** The three quantities the landing sheet offers. */
export const SHEET_QUANTITIES = [500, 2000, 5000];

/**
 * Landed cost per unit at a quantity, as the sheet prints it: every line is
 * rounded to cents and the landed total is the sum of those same lines.
 */
export function landedLines(product, settings, quantity) {
  const qty = Math.max(1, Math.round(Number(quantity) || 0));
  const tier = tierForQuantity(product, qty);
  const fob = Number(tier?.fob_usd) || 0;
  const fx = Number(settings?.fx_usd_to_aud) || 0;
  const goods = round2(fob * fx);
  const freight = round2(product?.freight_aud_per_unit_estimate);
  const dutyRate = product?.has_chafta_origin_cert
    ? 0
    : Number(settings?.default_duty_rate_no_origin_cert) || 0;
  const duty = round2(goods * dutyRate);
  const brokerFee = Number(settings?.broker_fee_aud) || 0;
  const broker = round2(brokerFee / qty);
  const gstRate = Number(settings?.gst_rate) || 0;
  const gst = round2(gstRate * (goods + freight + duty));
  return {
    qty,
    fob,
    fx,
    goods,
    freight,
    duty,
    dutyRate,
    broker,
    brokerFee,
    gst,
    gstRate,
    landed: round2(goods + freight + duty + broker + gst),
  };
}

/** The order at a quantity: goods, our fee to the member, inspection, total, deposit, balance. */
export function orderLines(product, settings, quantity) {
  const qty = Math.max(1, Math.round(Number(quantity) || 0));
  const unit = landedLines(product, settings, qty);
  const goods = round2(unit.fob * unit.fx * qty);
  const memberFee = round2(goods * (Number(settings?.buyer_service_fee_rate) || 0));
  const inspection = round2(settings?.inspection_fee_aud);
  const total = round2(goods + memberFee + inspection);
  const depositRate = Number(settings?.deposit_rate) || 0;
  const deposit = round2(total * depositRate);
  const commissionRate = Number(settings?.supplier_commission_rate) || 0;
  return {
    qty,
    goods,
    memberFee,
    inspection,
    total,
    depositRate,
    deposit,
    balance: round2(total - deposit),
    commissionRate,
    commission: round2(goods * commissionRate),
  };
}