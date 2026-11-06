import { useState } from "react";
import { Outlet } from "@tanstack/react-router";
import { useAuth } from "@/lib/AuthContext";
import AppFrame from "@/components/shell/AppFrame";
import HubSwitcher from "@/components/shell/HubSwitcher";
import LangSwitch from "@/components/shell/LangSwitch";
import { HubScopeProvider } from "@/components/shell/HubScope";
import { useAdminT } from "@/lib/adminI18n";

const NAV = [
  { to: "/admin", labelKey: "nav.overview", exact: true },
  { to: "/admin/supplier-pipeline", labelKey: "nav.pipeline", adminOnly: true },
  { to: "/admin/suppliers", labelKey: "nav.suppliers", adminOnly: true },
  { to: "/admin/products", labelKey: "nav.products", adminOnly: true },
  { to: "/admin/hubs", labelKey: "nav.hubs" },
  { to: "/admin/containers", labelKey: "nav.containers" },
  { to: "/admin/sample-inventory", labelKey: "nav.inventory" },
  { to: "/admin/sample-requests", labelKey: "nav.requests" },
  { to: "/admin/members", labelKey: "nav.members" },
  { to: "/admin/orders", labelKey: "nav.orders" },
  { to: "/admin/supplier-payouts", labelKey: "nav.payouts", adminOnly: true },
  { to: "/admin/categories", labelKey: "nav.categories", adminOnly: true },
  { to: "/admin/settings", labelKey: "nav.settings", adminOnly: true },
];

export default function ConsoleShell({ user }) {
  // Admins start on All; hub staff start on their own hub.
  const [hub, setHub] = useState(user?.role === "admin" ? "ALL" : user?.hub_code ?? "ALL");
  const { logout } = useAuth();
  const { t } = useAdminT();

  const nav = (user?.role === "admin" ? NAV : NAV.filter((item) => !item.adminOnly)).map((item) => ({
    to: item.to,
    exact: item.exact,
    label: t(item.labelKey),
  }));

  const brand = (
    <div>
      <span className="inline-flex rounded-control bg-sheet px-2 py-1 text-label text-app-ink">
        {t("common.teamConsole")}
      </span>
      <p className="mt-2 text-body text-app-meta">{t("common.australia")}</p>
    </div>
  );

  const footer = (
    <div className="space-y-4">
      <LangSwitch />
      <div className="space-y-1.5">
        <p className="text-body font-medium">
          {user?.role === "admin" ? t("common.admin") : t("common.hubStaff")}
        </p>
        <p className="truncate text-body text-app-meta">{user?.email}</p>
        <button
          type="button"
          onClick={() => logout()}
          className="block text-body text-app-meta transition-colors hover:text-app-ink"
        >
          {t("common.signOut")}
        </button>
      </div>
    </div>
  );

  return (
    <HubScopeProvider value={{ hub, setHub }}>
      <AppFrame nav={nav} brand={brand} footer={footer} topBarRight={<HubSwitcher />}>
        <Outlet />
      </AppFrame>
    </HubScopeProvider>
  );
}