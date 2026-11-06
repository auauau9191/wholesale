const ACTION =
  "mt-4 inline-flex min-h-[44px] w-full items-center justify-center rounded-control bg-app-ink px-4 text-body font-medium text-sheet transition-transform duration-150 active:scale-[0.97] disabled:opacity-40";

/** Approve: the order is locked to this unit and spec. No credit now. */
export default function ApprovePanel({ sample, orderCredits, disabled, pending, onSubmit }) {
  const unitShort = String(sample.unit_id ?? "").split("-").pop();
  return (
    <div className="mt-4 rounded-card bg-pill-green p-4 text-body text-pill-green-ink">
      <p>
        Your bulk order will be locked to unit <span className="tabular">{unitShort}</span>
        {sample.revision ? (
          <>
            {" "}and spec <span className="tabular">{sample.revision}</span>
          </>
        ) : null}
        . Placing it unlocks <span className="font-medium">{orderCredits} free sample credits</span> in any category.
      </p>
      <button type="button" onClick={onSubmit} disabled={disabled || pending} className={ACTION}>
        {pending ? "Saving your decision" : "Start bulk order"}
      </button>
    </div>
  );
}