import { createFileRoute } from "@tanstack/react-router";
import { ConsolePage } from "@/components/shell/PageBlocks";
import { useAdminT } from "@/lib/adminI18n";

export const Route = createFileRoute("/_authed/admin/sample-inventory")({
  head: () => ({ meta: [{ title: "Sample inventory · Wholesale System" }] }),
  component: SampleInventoryPage,
});

function SampleInventoryPage() {
  const { t } = useAdminT();

  return (
    <ConsolePage
      title={t("page.inventory.title")}
      note={t("page.inventory.note")}
      scoped
      emptyTitle={t("page.inventory.emptyTitle")}
      emptyNote={t("page.inventory.emptyNote")}
    />
  );
}