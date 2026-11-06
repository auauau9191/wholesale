/** The three statements that drive the olive panel, with their piece under them on a phone. */
export default function Statements({ settings, refs, pieces }) {
  const deposit = Math.round((Number(settings.depositRate) || 0) * 100);
  const statements = [
    {
      title: "See the factory on our film, not on theirs.",
      body: "At every factory our filmer holds up a board with the supplier's ID and the date: at the gate, on the line, at the quality bench and in packing. We score each supplier out of 100, and anything under 70 isn't listed.",
    },
    {
      title: "Then hold the sample here in Australia.",
      body: `Every product has units on our shelf. Yours leaves within ${settings.dispatchDays} business days, and you have ${settings.decisionDays} days to say yes, no or change it. One sample at a time, so the shelf stays stocked for everyone.`,
    },
    {
      title: "Order against the sample you held.",
      body: `Your order is locked to that unit and its signed spec. You pay ${deposit}% to start production; the supplier gets the other ${100 - deposit}% only after an inspector matches the goods to the sealed master on our shelf.`,
    },
  ];

  return (
    <div>
      <h2 className="text-section font-medium leading-[1.1] tracking-[-0.02em]">
        See it, touch it, order it
      </h2>
      {statements.map((statement, index) => (
        <div
          key={statement.title}
          ref={(node) => {
            refs.current[index + 1] = node;
          }}
          className="flex min-h-[60vh] flex-col justify-center py-10 md:min-h-[80vh] md:py-12"
        >
          <h3 className="max-w-[480px] text-[24px] font-medium leading-[1.14] tracking-[-0.02em] md:text-section md:leading-[1.1]">
            {statement.title}
          </h3>
          <p className="mt-4 max-w-[470px] text-lead leading-[26px] text-ink-soft">
            {statement.body}
          </p>
          <div className="mt-6 md:hidden">{pieces[index + 1]}</div>
        </div>
      ))}
    </div>
  );
}