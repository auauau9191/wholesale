import { createFileRoute } from "@tanstack/react-router";
import { ConsolePage } from "@/components/shell/PageBlocks";
import { useAdminT } from "@/lib/adminI18n";

export const Route = createFileRoute("/_authed/admin/")({
  head: () => ({ meta: [{ title: "Overview · Wholesale System" }] }),
  component: OverviewPage,
});

function OverviewPage() {
  const { t } = useAdminT();

  return (
    <ConsolePage
      title={t("page.overview.title")}
      note={t("page.overview.note")}
      scoped
      emptyTitle={t("page.overview.emptyTitle")}
      emptyNote={t("page.overview.emptyNote")}
    />
  );
}