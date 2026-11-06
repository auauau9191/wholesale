import { createFileRoute } from "@tanstack/react-router";
import { ConsolePage } from "@/components/shell/PageBlocks";

export const Route = createFileRoute("/_authed/admin/categories")({
  head: () => ({ meta: [{ title: "Categories · Wholesale System" }] }),
  component: CategoriesPage,
});

function CategoriesPage() {
  return (
    <ConsolePage
      title="Categories"
      note="What members can browse, and the risk tier behind each one."
      emptyTitle="No categories yet."
      emptyNote="A category needs a code and a risk tier before products can join it."
    />
  );
}