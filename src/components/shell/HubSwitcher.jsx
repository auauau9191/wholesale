import { HUB_OPTIONS, useHubScope } from "@/components/shell/HubScope";
import { useAdminT } from "@/lib/adminI18n";

const labelOf = (t, value) => (value === "ALL" ? t("common.all") : t(`hub.short.${value}`));

/** All, Brisbane, Sydney: the console's scope for every hub page. */
export default function HubSwitcher() {
  const { hub, setHub } = useHubScope();
  const { t } = useAdminT();

  return (
    <div className="flex items-center gap-0.5 rounded-control bg-frame p-0.5" role="group" aria-label={t("nav.hubs")}>
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
            {labelOf(t, option.value)}
          </button>
        );
      })}
    </div>
  );
}