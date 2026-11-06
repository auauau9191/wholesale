import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import DataBlock from "@/components/shell/DataBlock";
import PageHead from "@/components/shell/PageHead";
import SettingsForm from "@/components/console/settings/SettingsForm";
import { getAdminSettings } from "@/services/adminService";
import { useAdminT } from "@/lib/adminI18n";

export const Route = createFileRoute("/_authed/admin/settings")({
  head: () => ({ meta: [{ title: "Settings · Wholesale System" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const { t } = useAdminT();
  const { data, isLoading, error } = useQuery({ queryKey: ["admin-settings"], queryFn: getAdminSettings });

  return (
    <div className="space-y-6">
      <PageHead title={t("page.settings.title")} note={t("page.settings.note")} />
      {isLoading ? <DataBlock state="loading" /> : null}
      {error ? <DataBlock state="error" note={error.message} /> : null}
      {data?.id ? <SettingsForm settings={data} /> : null}
      {data && !data.id ? (
        <DataBlock
          title={t("page.settings.missingTitle")}
          note={t("page.settings.missingNote")}
        />
      ) : null}
    </div>
  );
}