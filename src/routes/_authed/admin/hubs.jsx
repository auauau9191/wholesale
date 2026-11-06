import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import DataBlock from "@/components/shell/DataBlock";
import PageHead from "@/components/shell/PageHead";
import HubCard from "@/components/console/HubCard";
import { getHubs } from "@/services/adminService";
import { useAdminT } from "@/lib/adminI18n";

export const Route = createFileRoute("/_authed/admin/hubs")({
  head: () => ({ meta: [{ title: "Hubs · Wholesale System" }] }),
  component: HubsPage,
});

function HubsPage() {
  const { t } = useAdminT();
  const { data, isLoading, error } = useQuery({ queryKey: ["hubs"], queryFn: getHubs });

  return (
    <div className="space-y-6">
      <PageHead
        title={t("page.hubs.title")}
        note={
          data
            ? t("page.hubs.note", { count: data.rows.filter((hub) => hub.is_active).length })
            : t("page.hubs.notePlain")
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
          <DataBlock title={t("page.hubs.emptyTitle")} note={t("page.hubs.emptyNote")} />
        )
      ) : null}
    </div>
  );
}