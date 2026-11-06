import { createFileRoute } from "@tanstack/react-router";
import { ConsolePage } from "@/components/shell/PageBlocks";
import { useAdminT } from "@/lib/adminI18n";

export const Route = createFileRoute("/_authed/admin/members")({
  head: () => ({ meta: [{ title: "Members · Wholesale System" }] }),
  component: MembersPage,
});

function MembersPage() {
  const { t } = useAdminT();

  return (
    <ConsolePage
      title={t("page.members.title")}
      note={t("page.members.note")}
      scoped
      emptyTitle={t("page.members.emptyTitle")}
      emptyNote={t("page.members.emptyNote")}
    />
  );
}