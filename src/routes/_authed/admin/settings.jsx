import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import DataBlock from "@/components/shell/DataBlock";
import PageHead from "@/components/shell/PageHead";
import SettingsForm from "@/components/console/settings/SettingsForm";
import { getAdminSettings } from "@/services/adminService";

export const Route = createFileRoute("/_authed/admin/settings")({
  head: () => ({ meta: [{ title: "Settings · Wholesale System" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const { data, isLoading, error } = useQuery({ queryKey: ["admin-settings"], queryFn: getAdminSettings });

  return (
    <div className="space-y-6">
      <PageHead
        title="Settings"
        note="Every number the platform runs on: prices, rates, fees and the promises we make. Nothing here is hard-coded elsewhere."
      />
      {isLoading ? <DataBlock state="loading" /> : null}
      {error ? <DataBlock state="error" note={error.message} /> : null}
      {data?.id ? <SettingsForm settings={data} /> : null}
      {data && !data.id ? (
        <DataBlock title="The settings record is missing." note="One settings record holds every number; it needs to exist before it can be edited." />
      ) : null}
    </div>
  );
}