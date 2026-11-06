import { HUB_OPTIONS, useHubScope } from "@/components/shell/HubScope";

/** All, Brisbane, Sydney: the console's scope for every hub page. */
export default function HubSwitcher() {
  const { hub, setHub } = useHubScope();

  return (
    <div className="flex items-center gap-0.5 rounded-control bg-frame p-0.5" role="group" aria-label="Hub scope">
      {HUB_OPTIONS.map((option) => {
        const active = hub === option.value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => setHub(option.value)}
            aria-pressed={active}
            className={[
              "min-h-[30px] rounded-control px-3 text-body transition-colors",
              active
                ? "bg-sheet text-app-ink"
                : "text-app-meta hover:text-app-ink",
            ].join(" ")}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}