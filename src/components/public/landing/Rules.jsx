import { Lock } from "lucide-react";

function Proof({ rows, note }) {
  return (
    <div className="bg-paper p-4 text-body text-ink">
      <dl className="space-y-2">
        {rows.map(([label, value]) => (
          <div key={label} className="flex items-baseline justify-between gap-3">
            <dt className="text-ink-soft">{label}</dt>
            <dd className="shrink-0 tabular">{value}</dd>
          </div>
        ))}
      </dl>
      {note ? (
        <p className="mt-3 flex items-center gap-2 text-label text-ink-soft">
          <Lock className="h-3.5 w-3.5" aria-hidden="true" />
          {note}
        </p>
      ) : null}
    </div>
  );
}

/** The four rules that keep the shelf fair for everyone buying from it. */
export default function Rules({ settings }) {
  const rules = [
    {
      rows: [
        ["Current sample", "On its way"],
        ["Next request", "after you decide"],
      ],
      text: `One sample at a time. Say yes, no or change it within ${settings.decisionDays} days, and the next one opens. If you say no and tell us why, you get one free swap in the same category.`,
    },
    {
      rows: [
        ["Joined · ABN · · · · · · · 556", "+ 1 credit"],
        ["Sample S07 requested", "− 1"],
        ["Rejoined with the same ABN", "0"],
      ],
      text: "Your first sample is on us. Cancel and rejoin with the same ABN and you won't get another; that keeps the shelf for buyers who mean it.",
    },
    {
      rows: [
        ["Order WS-0142 deposit received", "+ 2 credits"],
        ["Usable in", "any category"],
      ],
      text: `Each bulk order unlocks two more free samples, in any category. Otherwise a sample is A$${settings.sampleFee}, and we credit it back if you order that product within 90 days.`,
    },
    {
      rows: [
        ["Supplier", "CN014"],
        ["Legal name, WeChat, email", "after your order"],
      ],
      note: "Hidden while you browse",
      text: "Contacts open when you order. You see the film, the score and every price. The supplier's name and contacts open once your order is placed through us, so the inspection and the spec lock cover you.",
    },
  ];

  return (
    <section id="rules" className="mx-auto w-full max-w-[1440px] px-5 py-16 md:px-10 md:py-24">
      <h2 className="max-w-[720px] text-[30px] font-medium leading-[1.1] tracking-[-0.02em] md:text-section">
        Four rules that keep it fair
      </h2>
      <div className="mt-10 grid gap-8 md:grid-cols-2 md:gap-x-12 md:gap-y-10">
        {rules.map((rule) => (
          <div key={rule.text} className="grid items-start gap-4 sm:grid-cols-[minmax(0,0.9fr)_minmax(0,1fr)]">
            <Proof rows={rule.rows} note={rule.note} />
            <p className="max-w-[360px] text-body leading-[22px] text-ink-soft">{rule.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}