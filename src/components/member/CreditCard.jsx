/** The member's sample credits, on the one dark card on the screen. */
export default function CreditCard({ balance }) {
  const heading = balance === 1 ? "1 free sample credit" : `${balance} credits`;
  const note =
    balance > 0
      ? "Approve a sample and place an order to unlock 2 more"
      : "Place an order to unlock 2 more";

  return (
    <div className="rounded-card bg-app-ink px-5 py-5 text-sheet md:px-6">
      <p className="text-lead font-medium">{heading}</p>
      <p className="mt-1.5 max-w-[420px] text-body text-sheet/70">{note}</p>
    </div>
  );
}