import { createFileRoute } from "@tanstack/react-router";
import { ConsolePage } from "@/components/shell/PageBlocks";

export const Route = createFileRoute("/_authed/admin/settings")({
  head: () => ({ meta: [{ title: "Settings · Wholesale System" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  return (
    <ConsolePage
      title="Settings"
      note="Every number the platform runs on: prices, rates, fees and the promises we make."
      emptyTitle="The numbers are stored in one settings record."
      emptyNote="Editing them arrives with the settings screen."
    />
  );
}