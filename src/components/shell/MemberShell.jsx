import { Link, Outlet } from "@tanstack/react-router";
import { useAuth } from "@/lib/AuthContext";
import { formatDate } from "@/lib/format";
import AppFrame from "@/components/shell/AppFrame";

const NAV = [
  { to: "/browse", label: "Browse" },
  { to: "/samples", label: "Samples" },
  { to: "/orders", label: "Orders" },
  { to: "/compare", label: "Compare" },
];

const BOTTOM = [
  { to: "/browse", label: "Browse" },
  { to: "/samples", label: "Samples" },
  { to: "/orders", label: "Orders" },
  { to: "/account", label: "Account" },
];

const PLAN_LABEL = {
  starter_quarter: "Starter quarter",
  monthly: "Monthly",
  annual: "Annual",
};

export default function MemberShell({ profile, children }) {
  const { logout } = useAuth();

  const planLine = profile
    ? `${PLAN_LABEL[profile.plan] ?? "Member"}${
        profile.plan_started_on ? ` · joined ${formatDate(profile.plan_started_on)}` : ""
      }`
    : "Membership pending review";

  const footer = (
    <div className="space-y-1.5">
      <p className="text-body font-medium">
        {profile?.business_name || "Your business"}
      </p>
      <p className="text-body text-app-meta">{planLine}</p>
      <Link
        to="/account"
        className="inline-block text-body text-app-ink underline-offset-4 hover:underline"
      >
        Account
      </Link>
      <button
        type="button"
        onClick={() => logout()}
        className="block text-body text-app-meta transition-colors hover:text-app-ink"
      >
        Sign out
      </button>
    </div>
  );

  const brand = (
    <div>
      <p className="text-body font-medium">{profile?.business_name || "Your business"}</p>
      <p className="mt-1 text-body text-app-meta">Member</p>
    </div>
  );

  const bottomBar = (
    <div className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-4 bg-sheet md:hidden">
      {BOTTOM.map((item) => (
        <Link
          key={item.to}
          to={item.to}
          activeOptions={{ exact: false }}
          activeProps={{ "data-active": "true" }}
          className="flex min-h-[56px] items-center justify-center text-body text-app-meta data-[active=true]:text-app-ink"
        >
          {item.label}
        </Link>
      ))}
    </div>
  );

  return (
    <AppFrame
      nav={NAV}
      brand={brand}
      footer={footer}
      bottomBar={bottomBar}
      topBarRight={
        <Link to="/compare" className="text-body text-app-meta md:hidden">
          Compare
        </Link>
      }
    >
      {children ?? <Outlet />}
    </AppFrame>
  );
}