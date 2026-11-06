/** Questions, answered: run-in paragraphs, two columns. */
export default function Questions({ settings }) {
  const months = Math.round((Number(settings.depositRate) || 0) * 100);
  const items = [
    [
      "Isn't this what Alibaba does?",
      "Alibaba is a directory: you find a factory, then carry the risk yourself. We visit the factory, film it, hold a sample in Australia, and lock your order to that sample.",
    ],
    [
      "Who films the factories?",
      "Our own filmer, on the visit that gets a factory listed. The board carried in every clip shows the supplier code and the date it was filmed.",
    ],
    [
      "Why can't I see a supplier's name?",
      "You see the film, the score and every price. The supplier's legal name and contacts open once your order is placed through us, so the inspection and the spec lock cover you and the factory signs one price list for every member.",
    ],
    [
      "What if the bulk goods don't match the sample?",
      "They don't ship. The inspector compares the goods with the sealed master on our shelf, and a failed inspection is booked again before the balance falls due.",
    ],
    [
      "Who is the importer?",
      "The goods are invoiced through us and cleared by our customs broker partner, so the paperwork runs in one name from the factory to your door.",
    ],
    [
      "Will I pay duty?",
      "Often not. Chinese goods with a ChAFTA origin certificate enter Australia duty free; without one, duty is about 5% of the goods value. Every landed-cost sheet shows which applies to that product.",
    ],
    [
      "Do I need an ABN?",
      "Yes. We check it against the register, then activate your account within one business day.",
    ],
    [
      "Can I keep the sample?",
      `Yes. Your first is free, once per ABN. A paid sample is yours too, and we credit the A$${settings.sampleFee} back if you order that product within 90 days.`,
    ],
    [
      "What happens after three months?",
      `The starter quarter ends and the plan moves to A$${settings.monthlyPrice} a month, or A$${settings.annualPrice} for a year. We email you seven days before it starts, and you can cancel any time after the first three months.`,
    ],
    [
      "Can I ask for a change to a product?",
      "Yes, through us. Colour, packaging and labelling changes are quoted by the factory and go into a new spec revision, signed before production starts.",
    ],
    [
      "How fast is a bulk order?",
      "Production usually runs about 25 days after the deposit, then sea freight. The product page carries the lead time for that item.",
    ],
    [
      "How do you make money?",
      `The plan, and ${Math.round((Number(settings.commissionRate) || 0) * 100)}% of the goods value that the factory pays out of its own side. You pay no fee on orders; inspection, freight, duty and GST are at cost, and ${months}% of the order starts production.`,
    ],
    [
      "Where are the samples kept?",
      "On shelves at our two hubs, Brisbane and Sydney, each unit tagged and checked against the sealed master when it lands.",
    ],
  ];

  return (
    <section id="questions" className="mx-auto w-full max-w-[1440px] px-5 py-16 md:px-10 md:py-24">
      <h2 className="text-[30px] font-medium leading-[1.1] tracking-[-0.02em] md:text-section">
        Questions, answered
      </h2>
      <div className="mt-8 gap-x-14 md:columns-2">
        {items.map(([question, answer]) => (
          <p key={question} className="mb-6 break-inside-avoid text-body leading-[22px] text-ink-soft">
            <span className="font-medium text-ink">{question}</span> {answer}
          </p>
        ))}
      </div>
    </section>
  );
}