import { formatAudWhole } from "@/lib/format";

/** No payment provider yet: the member transfers, and staff mark it received. */
export default function PaymentInstructions({ order }) {
  return (
    <section className="rounded-card border border-edge bg-sheet p-5">
      <h2 className="text-lead font-medium">Pay the {formatAudWhole(order.deposit_aud)} deposit</h2>
      <p className="mt-1 max-w-[520px] text-body text-app-soft">
        Transfer it with your order number as the reference. Production starts once we have it.
      </p>
      <dl className="mt-4 space-y-2 text-body">
        <div className="flex justify-between gap-4">
          <dt className="text-app-soft">Pay to</dt>
          <dd className="text-right">[YOUR BANK / PAYID DETAILS]</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-app-soft">Reference</dt>
          <dd className="tabular">{order.order_no}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-app-soft">Amount</dt>
          <dd className="tabular font-medium">{formatAudWhole(order.deposit_aud)}</dd>
        </div>
      </dl>
    </section>
  );
}