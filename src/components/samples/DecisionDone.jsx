import { Link } from "@tanstack/react-router";

const ACTION =
  "mt-4 inline-flex min-h-[44px] items-center justify-center rounded-control bg-app-ink px-5 text-body font-medium text-sheet transition-transform duration-150 active:scale-[0.97]";

/** After the decision: what happens next, and the one action it leads to. */
export default function DecisionDone({ sample }) {
  const unitShort = String(sample.unit_id ?? "").split("-").pop();
  return (
    <section className="rounded-card border border-edge bg-sheet p-5 md:p-6">
      <h2 className="text-lead font-medium">Your decision</h2>
      {sample.decision === "approve" ? (
        <>
          <p className="mt-2 text-body text-app-soft">
            Approved. Your bulk order will be locked to unit <span className="tabular">{unitShort}</span>.
          </p>
          <Link to="/orders/new" search={{ request: sample.id }} className={ACTION}>Start bulk order</Link>
        </>
      ) : null}
      {sample.decision === "reject" ? (
        <>
          <p className="mt-2 text-body text-app-soft">
            Rejected for {sample.decision_reason}. Your free swap is ready in {sample.category_name ?? "the same category"}.
          </p>
          {sample.category_code ? (
            <Link to="/category" search={{ code: sample.category_code }} className={ACTION}>Choose a swap</Link>
          ) : null}
        </>
      ) : null}
      {sample.decision === "change" ? (
        <p className="mt-2 text-body text-app-soft">
          Your change is with our team. We'll take it to the factory and come back to you.
        </p>
      ) : null}
    </section>
  );
}