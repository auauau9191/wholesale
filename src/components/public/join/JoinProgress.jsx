const STEPS = ["Plan", "Business details", "Review"];

/** Where you are in the three steps. No numbers, no rules: weight and a dot. */
export default function JoinProgress({ step }) {
  return (
    <ol className="flex flex-wrap items-center gap-x-6 gap-y-2 text-body">
      {STEPS.map((label, index) => {
        const number = index + 1;
        const current = number === step;
        return (
          <li
            key={label}
            aria-current={current ? "step" : undefined}
            className={number > step ? "text-ink-soft" : "text-ink"}
          >
            {current ? (
              <span className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-ink align-middle" />
            ) : null}
            <span className={current ? "font-medium" : ""}>{label}</span>
          </li>
        );
      })}
    </ol>
  );
}