import { useState } from "react";
import { Outlet } from "@tanstack/react-router";
import { useAuth } from "@/lib/AuthContext";
import AppFrame from "@/components/shell/AppFrame";
import HubSwitcher from "@/components/shell/HubSwitcher";
import { HubScopeProvider } from "@/components/shell/HubScope";

const NAV = [
  { to: "/admin", label: "Overview", exact: true },
  { to: "/admin/supplier-pipeline", label: "Supplier pipeline", adminOnly: true },
  { to: "/admin/suppliers", label: "Suppliers", adminOnly: true },
  { to: "/admin/products", label: "Products", adminOnly: true },
  { to: "/admin/hubs", label: "Hubs" },
  { to: "/admin/containers", label: "Containers" },
  { to: "/admin/sample-inventory", label: "Sample inventory" },
  { to: "/admin/sample-requests", label: "Sample requests" },
  { to: "/admin/members", label: "Members" },
  { to: "/admin/orders", label: "Orders and inspections" },
  { to: "/admin/supplier-payouts", label: "Supplier payouts", adminOnly: true },
  { to: "/admin/categories", label: "Categories", adminOnly: true },
  { to: "/admin/settings", label: "Settings", adminOnly: true },
];

export default function ConsoleShell({ user }) {
  // Admins start on All; hub staff start on their own hub.
  const [hub, setHub] = useState(user?.role === "admin" ? "ALL" : user?.hub_code ?? "ALL");
  const { logout } = useAuth();

  const brand = (
    <div>
      <span className="inline-flex rounded-control bg-sheet px-2 py-1 text-label text-app-ink">
        Team console
      </span>
      <p className="mt-2 text-body text-app-meta">Australia</p>
    </div>
  );

  const footer = (
    <div className="space-y-1.5">
      <p className="text-body font-medium">
        {user?.role === "admin" ? "Admin" : "Hub staff"}
      </p>
      <p className="truncate text-body text-app-meta">{user?.email}</p>
      <button
        type="button"
        onClick={() => logout()}
        className="block text-body text-app-meta transition-colors hover:text-app-ink"
      >
        Sign out
      </button>
    </div>
  );

  return (
    <HubScopeProvider value={{ hub, setHub }}>
      <AppFrame
        nav={user?.role === "admin" ? NAV : NAV.filter((item) => !item.adminOnly)}
        brand={brand}
        footer={footer}
        topBarRight={<HubSwitcher />}
      >
        <Outlet />
      </AppFrame>
    </HubScopeProvider>
  );
}