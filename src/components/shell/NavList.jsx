import { Link } from "@tanstack/react-router";

/**
 * Sidebar navigation. The selected item is a grey pill; nothing else is filled.
 */
export default function NavList({ items, className = "", onNavigate, large = false }) {
  return (
    <nav className={`flex flex-col gap-0.5 ${className}`}>
      {items.map((item) => (
        <Link
          key={item.to}
          to={item.to}
          onClick={onNavigate}
          activeOptions={{ exact: item.exact === true }}
          activeProps={{ "data-active": "true", "aria-current": "page" }}
          className={[
            "group flex min-h-[44px] items-center justify-between gap-3 rounded-control px-3 text-body text-app-ink transition-colors",
            "hover:bg-pill-grey",
            "data-[active=true]:bg-pill-grey data-[active=true]:text-pill-grey-ink",
          ].join(" ")}
        >
          <span className="truncate">{item.label}</span>
          {item.count ? (
            <span className="tabular text-app-meta">{item.count}</span>
          ) : null}
        </Link>
      ))}
    </nav>
  );
}