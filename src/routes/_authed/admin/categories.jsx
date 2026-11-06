import { createFileRoute } from "@tanstack/react-router";
import { ConsolePage } from "@/components/shell/PageBlocks";
import { useAdminT } from "@/lib/adminI18n";

export const Route = createFileRoute("/_authed/admin/categories")({
  head: () => ({ meta: [{ title: "Categories · Wholesale System" }] }),
  component: CategoriesPage,
});

function CategoriesPage() {
  const { t } = useAdminT();

  return (
    <ConsolePage
      title={t("page.categories.title")}
      note={t("page.categories.note")}
      emptyTitle={t("page.categories.emptyTitle")}
      emptyNote={t("page.categories.emptyNote")}
    />
  );
}