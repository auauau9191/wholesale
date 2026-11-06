import { createFileRoute } from "@tanstack/react-router";
import MemberPage from "@/components/shell/PageBlocks";

export const Route = createFileRoute("/_authed/_app/browse")({
  head: () => ({ meta: [{ title: "Browse · Wholesale System" }] }),
  component: BrowsePage,
});

function BrowsePage() {
  return (
    <MemberPage
      title="Browse"
      note="Verified products from factories we have visited and filmed."
      emptyTitle="No products live yet."
      emptyNote="Products appear here once a supplier passes verification and its first sample unit reaches a hub."
    />
  );
}