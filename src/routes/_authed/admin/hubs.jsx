import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import DataBlock from "@/components/shell/DataBlock";
import PageHead from "@/components/shell/PageHead";
import HubCard from "@/components/console/HubCard";
import { getHubs } from "@/services/adminService";

export const Route = createFileRoute("/_authed/admin/hubs")({
  head: () => ({ meta: [{ title: "Hubs · Wholesale System" }] }),
  component: HubsPage,
});

function HubsPage() {
  const { data, isLoading, error } = useQuery({ queryKey: ["hubs"], queryFn: getHubs });

  return (
    <div className="space-y-6">
      <PageHead
        title="Hubs"
        note={
          data
            ? `${data.rows.filter((hub) => hub.is_active).length} hubs taking samples. The first hub serves a member's state, the fallback rank decides which one is tried next.`
            : "Who runs each hub, which states it serves first and which hub is tried next."
        }
      />
      {isLoading ? <DataBlock state="loading" /> : null}
      {error ? <DataBlock state="error" note={error.message} /> : null}
      {data ? (
        data.rows.length ? (
          <div className="grid gap-4 xl:grid-cols-2">
            {data.rows.map((hub) => (
              <HubCard key={hub.id} hub={hub} canEdit={data.can_edit} />
            ))}
          </div>
        ) : (
          <DataBlock title="No hubs set up yet." note="Brisbane and Sydney each need a manager and a fallback order." />
        )
      ) : null}
    </div>
  );
}