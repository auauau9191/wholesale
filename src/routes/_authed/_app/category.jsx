import { createFileRoute } from "@tanstack/react-router";
import MemberPage from "@/components/shell/PageBlocks";

export const Route = createFileRoute("/_authed/_app/category")({
  head: () => ({ meta: [{ title: "Category · Wholesale System" }] }),
  component: CategoryPage,
});

function CategoryPage() {
  return (
    <MemberPage
      title="Category"
      note="Products grouped by what they are."
      emptyTitle="No categories are live yet."
      emptyNote="Categories open as the catalogue grows."
    />
  );
}