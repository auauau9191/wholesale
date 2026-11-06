import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import DataBlock from "@/components/shell/DataBlock";
import { useHubScope } from "@/components/shell/HubScope";
import QueueHead from "@/components/console/QueueHead";
import QueueCounts from "@/components/console/QueueCounts";
import RequestTable from "@/components/console/RequestTable";
import RequestRows from "@/components/console/RequestRows";
import ShelfPanel from "@/components/console/ShelfPanel";
import LowStockPanel from "@/components/console/LowStockPanel";
import { QUEUE_FILTERS } from "@/lib/requestLabels";
import { fetchSampleQueue } from "@/services/adminService";

export const Route = createFileRoute("/_authed/admin/sample-requests")({
  head: () => ({ meta: [{ title: "Sample requests · Wholesale System" }] }),
  component: SampleRequestsPage,
});

const EMPTY = {
  awaiting: "Nothing to send. New requests land here the moment a member asks.",
  on_hold: "No requests are on hold.",
  in_transit: "No samples are on the road.",
  deciding: "No members are deciding right now.",
  overdue: "No decisions are overdue.",
};

function SampleRequestsPage() {
  const { hub } = useHubScope();
  const [filter, setFilter] = useState("awaiting");
  const queue = useQuery({ queryKey: ["sample-queue", hub], queryFn: () => fetchSampleQueue(hub) });
  const data = queue.data;
  const rows = data?.rows.filter((row) => row.bucket === filter) ?? [];
  const current = QUEUE_FILTERS.find((item) => item.key === filter);

  return (
    <div className="space-y-6">
      <QueueHead queue={data} hub={hub} rows={rows} updatedAt={queue.dataUpdatedAt} />
      {queue.isLoading ? <DataBlock state="loading" /> : null}
      {queue.error ? <DataBlock state="error" note={queue.error.message} /> : null}
      {data ? (
        <>
          <QueueCounts counts={data.counts} value={filter} onChange={setFilter} />
          {filter === "low" ? (
            <LowStockPanel low={data.low} level={data.reorder_level} wide />
          ) : (
            <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_300px]">
              <section className="min-w-0 rounded-card border border-edge bg-sheet">
                <div className="flex items-baseline justify-between gap-3 px-5 pb-3 pt-5">
                  <h2 className="text-lead font-medium">{current.list}</h2>
                  <p className="tabular text-label text-app-meta">{rows.length} {rows.length === 1 ? "request" : "requests"}</p>
                </div>
                {rows.length ? (
                  <>
                    <div className="hidden md:block"><RequestTable rows={rows} /></div>
                    <div className="md:hidden"><RequestRows rows={rows} /></div>
                  </>
                ) : (
                  <p className="border-t border-rule px-5 py-6 text-body text-app-meta">{EMPTY[filter]}</p>
                )}
              </section>
              <div className="space-y-5">
                <ShelfPanel shelf={data.shelf} />
                <LowStockPanel low={data.low.slice(0, 5)} level={data.reorder_level} />
              </div>
            </div>
          )}
        </>
      ) : null}
    </div>
  );
}