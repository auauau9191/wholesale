import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import DataBlock from "@/components/shell/DataBlock";
import DispatchLabel from "@/components/console/DispatchLabel";
import { fetchDispatchLabels } from "@/services/adminService";

const HUBS = ["ALL", "BNE", "SYD"];

export const Route = createFileRoute("/_authed/admin_/dispatch-labels")({
  validateSearch: (search) => ({ hub: HUBS.includes(search.hub) ? search.hub : undefined }),
  head: () => ({ meta: [{ title: "Dispatch labels · Wholesale System" }] }),
  component: DispatchLabelsPage,
});

function DispatchLabelsPage() {
  const hub = Route.useSearch().hub ?? "ALL";
  const { data: labels, isLoading, error } = useQuery({
    queryKey: ["dispatch-labels", hub],
    queryFn: () => fetchDispatchLabels(hub),
  });

  return (
    <div className="min-h-screen bg-sheet p-6 print:p-0">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 print:hidden">
        <div>
          <h1 className="text-title font-medium">Dispatch labels</h1>
          <p className="tabular mt-1 text-body text-app-meta">
            {labels ? `${labels.length} ${labels.length === 1 ? "label" : "labels"} waiting to go out.` : "Loading labels."}
          </p>
        </div>
        <button
          type="button"
          onClick={() => window.print()}
          disabled={!labels?.length}
          className="min-h-[44px] rounded-control bg-app-ink px-4 text-body font-medium text-sheet disabled:opacity-40"
        >
          Print
        </button>
      </div>
      {isLoading ? <DataBlock state="loading" /> : null}
      {error ? <DataBlock state="error" note={error.message} /> : null}
      {labels && !labels.length ? <DataBlock title="No labels to print." note="Every request at this hub is out the door." /> : null}
      {labels?.length ? (
        <div className="grid gap-4 sm:grid-cols-2 print:grid-cols-2 print:gap-0">
          {labels.map((label) => (
            <DispatchLabel key={label.request_no} label={label} />
          ))}
        </div>
      ) : null}
    </div>
  );
}