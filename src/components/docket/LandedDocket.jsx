import { landedLines } from "@/lib/landedSheet";
import Printer from "@/components/docket/Printer";
import { DocketHead, DocketLine, DocketTotal, Printed, money } from "@/components/docket/Docket";
import { TillKeys } from "@/components/docket/Choices";

const n = (v) => Number(v).toLocaleString("en-AU");

/**
 * The landed-cost docket: every cost of one product to an Australian door at one quantity,
 * each line with the proof behind it. Figures come from landedLines(), the same formula the app uses.
 *
 * product: a Product row (product_id, name, price_tiers, freight_aud_per_unit_estimate,
 *          has_chafta_origin_cert, incoterm_port) plus optional `supplier` { supplier_code, verification_score, filmed_date }.
 * settings: the AppSettings row.
 * quantities: the quantities offered; `keys` prints them as till keys on the docket itself.
 */
export default function LandedDocket({ product, settings, quantity, quantities = [], onQuantity, keys = false, className }) {
  const r = landedLines(product, settings, quantity);
  const brokerFee = Number(settings?.broker_fee_aud) || 0;
  const inspection = Number(settings?.inspection_fee_aud) || 0;
  const depositPct = Math.round((Number(settings?.deposit_rate) || 0) * 100);
  const gstPct = Math.round((Number(settings?.gst_rate) || 0) * 100);
  const port = String(product?.incoterm_port ?? "").replace(/^FOB\s+/i, "");
  const s = product?.supplier;
  const filmed = s?.filmed_date ? new Date(s.filmed_date).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" }) : null;
  const goodsProof = s
    ? [filmed && `Filmed ${filmed}`, s.supplier_code && `${s.supplier_code} scored ${s.verification_score}/100`].filter(Boolean).join(", ")
    : "Factory filmed on our visit";
  const lot = r.landed * r.qty;

  const lines = [
    { label: `Product, US$${r.fob.toFixed(2)} at ${r.fx}`, amount: r.goods, proof: goodsProof },
    { label: "Sea freight, estimate", amount: r.freight, proof: port ? `Estimate, FOB ${port}` : "Estimate" },
    { label: "Import duty", amount: r.duty, proof: product?.has_chafta_origin_cert ? "0%: ChAFTA origin certificate on file" : "About 5%: no origin certificate" },
    { label: `Broker and port, A$${brokerFee} ÷ ${n(r.qty)}`, amount: r.broker, proof: "Our customs broker partner, at cost" },
    { label: `GST, ${gstPct}%`, amount: r.gst, proof: "On goods, freight and duty" },
  ];

  return (
    <Printer printKey={product?.product_id} className={className} label={`Landed cost of ${product?.name}`}>
      {({ printed }) => (
        <>
          <DocketHead left="LANDED COST SHEET" right={product?.product_id} />
          <p className="dk-docket__name">{product?.name}</p>
          <p className="dk-docket__meta dk-num"><Printed value={`${n(r.qty)} units to your door in Australia. Per unit.`} /></p>
          {keys && quantities.length ? (
            <TillKeys className="dk-docket__keys" ariaLabel="Quantity" items={quantities.map((q) => ({ value: q, label: n(q) }))} value={quantity} onChange={onQuantity} />
          ) : null}
          {lines.map((line, i) => (
            <DocketLine key={line.label.split(",")[0]} index={i} printed={printed} {...line} />
          ))}
          <DocketTotal amount={r.landed} printed={printed} ringDelay={lines.length * 110 + 120} proof="A sample of this unit is on our shelf. Inspected against it before it sails." />
          <div className="dk-docket__foot dk-num">
            Your lot: <b><Printed value={`${n(r.qty)} × ${money(r.landed)} = A$${lot.toLocaleString("en-AU", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} /></b>
            <br />plus pre-shipment inspection, A${n(inspection)} at cost. You pay {depositPct}% to start production.
          </div>
        </>
      )}
    </Printer>
  );
}
