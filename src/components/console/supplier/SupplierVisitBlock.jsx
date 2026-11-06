import { Block } from "@/components/console/FormBits";
import { CHECKS } from "@/lib/supplier-rules";

/** The visit, the film and the six checks we make on the factory floor. */
export default function SupplierVisitBlock({ draft, set }) {
  const passed = draft.checks_passed ?? [];
  const toggle = (check) =>
    set({ checks_passed: passed.includes(check) ? passed.filter((item) => item !== check) : [...passed, check] });

  return (
    <Block title="Visit and checks" note={`${passed.length} of ${CHECKS.length} checks passed.`}>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-label text-app-meta">Visited on</span>
          <input
            type="date"
            value={draft.visit_date ?? ""}
            onChange={(event) => set({ visit_date: event.target.value })}
            className="tabular mt-1 min-h-[36px] w-full rounded-control border border-control bg-sheet px-2.5 text-body outline-none focus:border-app-ink"
          />
        </label>
        <label className="block">
          <span className="text-label text-app-meta">Filmed on</span>
          <input
            type="date"
            value={draft.filmed_date ?? ""}
            onChange={(event) => set({ filmed_date: event.target.value })}
            className="tabular mt-1 min-h-[36px] w-full rounded-control border border-control bg-sheet px-2.5 text-body outline-none focus:border-app-ink"
          />
        </label>
      </div>
      <ul className="mt-4 space-y-1">
        {CHECKS.map((check) => (
          <li key={check}>
            <label className="flex min-h-[36px] items-center gap-2.5 text-body">
              <input
                type="checkbox"
                checked={passed.includes(check)}
                onChange={() => toggle(check)}
                className="h-4 w-4 rounded-[3px] border-control accent-data"
              />
              {check}
            </label>
          </li>
        ))}
      </ul>
    </Block>
  );
}