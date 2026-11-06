const STEPS = [
  "Factory floor, China",
  "Verified on our own film",
  "Containers to Australia",
  "Two hubs: Brisbane and Sydney",
  "Your door",
];

/** The route: the path every product takes before it reaches a member. */
export default function RouteStrip({ className = "" }) {
  return (
    <ol className={`flex flex-col gap-3 text-body text-ink-soft md:flex-row md:flex-wrap md:items-center md:gap-x-3 ${className}`}>
      {STEPS.map((step, index) => (
        <li key={step} className="flex items-center gap-3">
          {index > 0 ? <span aria-hidden="true" className="hidden md:inline">→</span> : null}
          <span className={index === 4 ? "text-ink" : undefined}>{step}</span>
        </li>
      ))}
    </ol>
  );
}