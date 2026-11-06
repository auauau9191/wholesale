import { Link } from "@tanstack/react-router";

/** What it costs, set like a menu: membership, samples, orders. */
export default function Prices({ settings }) {
  const commission = Math.round((Number(settings.commissionRate) || 0) * 100);
  const groups = [
    {
      title: "Membership",
      rows: [
        [
          "First three months",
          `A$${settings.starterPrice}`,
          "Paid once at the start. Every supplier, film, price and document, and your first sample free.",
        ],
        [
          "Each month after",
          `${settings.monthlyPrice}`,
          "We email you seven days before it starts. Cancel any time after the first three months.",
        ],
        ["A year, paid up front", `${settings.annualPrice}`, "Two months free, first sample included."],
      ],
    },
    {
      title: "Samples",
      rows: [
        [
          "Your first sample",
          "A$0",
          `Once per ABN. Sent from our Australian shelf within ${settings.dispatchDays} business days.`,
        ],
        [
          "Two after each bulk order",
          "0",
          "Unlocked when your deposit lands, usable in any category.",
        ],
        [
          "Any other sample",
          `${settings.sampleFee}`,
          "Credited back if you order that product within 90 days.",
        ],
      ],
    },
    {
      title: "Orders",
      rows: [
        [
          "Our fee on your order",
          "A$0",
          `The factory pays us ${commission}% from its side and signs one price list for every member, so it can't be added back onto yours.`,
        ],
        [
          "Pre-shipment inspection",
          `A$${settings.inspection}`,
          "An independent inspector checks the goods against the sealed master.",
        ],
        [
          "Freight, duty and GST",
          "at cost",
          "Quoted by our customs broker partner before you pay the deposit.",
        ],
      ],
    },
  ];

  return (
    <section id="prices" className="mx-auto w-full max-w-[1440px] px-5 py-16 md:px-10 md:py-24">
      <h2 className="text-[30px] font-medium leading-[1.1] tracking-[-0.02em] md:text-section">
        What it costs
      </h2>

      <div className="mt-8 grid gap-10 md:grid-cols-3 md:gap-12">
        {groups.map((group) => (
          <div key={group.title}>
            <p className="text-body font-medium">{group.title}</p>
            <dl className="mt-3 divide-y divide-ink/15">
              {group.rows.map(([label, price, note]) => (
                <div key={label} className="py-4">
                  <div className="flex items-baseline justify-between gap-4">
                    <dt className="text-lead">{label}</dt>
                    <dd className="shrink-0 text-lead tabular">{price}</dd>
                  </div>
                  <p className="mt-1 text-body leading-[20px] text-ink-soft">{note}</p>
                </div>
              ))}
            </dl>
          </div>
        ))}
      </div>

      <div className="mt-10">
        <Link
          to="/join"
          className="flex min-h-[52px] w-full items-center justify-center bg-ink px-8 text-lead font-medium text-ground transition-transform duration-150 active:scale-[0.97] md:inline-flex md:w-auto"
        >
          Start membership for A${settings.starterPrice}
        </Link>
        <p className="mt-3 max-w-[560px] text-body text-ink-soft">
          You&apos;ll need an ABN. We check it, then activate your account within one business day.
        </p>
      </div>
    </section>
  );
}