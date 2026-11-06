import CountUp from "@/components/motion/CountUp";
import { formatAudWhole } from "@/lib/format";

/** 30% now, held by us; the rest once inspection passes. */
export default function HowYouPay({ quote, depositRate }) {
  const now = Math.round((depositRate ?? 0) * 100);
  return (
    <section className="rounded-card border border-edge bg-sheet p-5">
      <h2 className="text-lead font-medium">How you pay</h2>
      <div className="mt-4 flex gap-3">
        <span className="tabular h-fit shrink-0 rounded-full bg-pill-green px-2 py-0.5 text-label text-pill-green-ink">{now}%</span>
        <div>
          <p className="text-body font-medium"><CountUp value={quote.deposit_aud} format={formatAudWhole} /> now</p>
          <p className="text-body text-app-soft">Held by us, released to start production.</p>
        </div>
      </div>
      <div className="mt-4 flex gap-3">
        <span className="tabular h-fit shrink-0 rounded-full bg-pill-amber px-2 py-0.5 text-label text-pill-amber-ink">{100 - now}%</span>
        <div>
          <p className="text-body font-medium"><CountUp value={quote.balance_aud} format={formatAudWhole} /> after inspection passes</p>
          <p className="text-body text-app-soft">Fails? The supplier reworks at its cost. Fails twice? Your deposit is refunded.</p>
        </div>
      </div>
    </section>
  );
}