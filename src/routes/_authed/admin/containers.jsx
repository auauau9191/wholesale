import { createFileRoute } from "@tanstack/react-router";
import { ConsolePage } from "@/components/shell/PageBlocks";

export const Route = createFileRoute("/_authed/admin/containers")({
  head: () => ({ meta: [{ title: "Containers · Wholesale System" }] }),
  component: ContainersPage,
});

function ContainersPage() {
  return (
    <ConsolePage
      title="Containers"
      note="What is at sea, what has landed and what is waiting on the broker."
      scoped
      emptyTitle="No containers booked."
      emptyNote="Sample consolidations arrive before the first order container."
    />
  );
}