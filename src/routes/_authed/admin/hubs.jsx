import { createFileRoute } from "@tanstack/react-router";
import { ConsolePage } from "@/components/shell/PageBlocks";

export const Route = createFileRoute("/_authed/admin/hubs")({
  head: () => ({ meta: [{ title: "Hubs · Wholesale System" }] }),
  component: HubsPage,
});

function HubsPage() {
  return (
    <ConsolePage
      title="Hubs"
      note="Who runs each hub, which states it serves first and which hub is tried next."
      scoped
      emptyTitle="No hubs set up yet."
      emptyNote="Brisbane and Sydney each need a manager, a street address and a fallback order."
    />
  );
}