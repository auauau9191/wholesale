import { Link } from "@tanstack/react-router";
import SampleTag from "@/components/brand/SampleTag";
import { useAuth } from "@/lib/AuthContext";

/** The landing nav: how it works, the mark, prices and the way in. */
export default function LandingNav() {
  const { user, isLoadingAuth } = useAuth();
  const staff = user && (user.role === "admin" || ["BNE", "SYD", "ALL"].includes(user.hub_code));
  const way = isLoadingAuth ? null : user ? (staff ? ["/admin", "Console"] : ["/browse", "Catalogue"]) : ["/login", "Sign in"];
  return (
    <nav className="grid grid-cols-3 items-center gap-4 py-4 text-body text-ink">
      <a href="#how-it-works" className="justify-self-start underline-offset-4 hover:underline">
        How it works
      </a>
      <Link to="/" className="flex items-center gap-2 justify-self-center" aria-label="Wholesale System, home">
        <SampleTag className="h-5 w-auto" />
        <span className="font-medium">Wholesale System</span>
      </Link>
      <span className="flex items-center gap-5 justify-self-end">
        <a href="#prices" className="hidden underline-offset-4 hover:underline sm:inline">
          Prices
        </a>
        {way ? (
          <Link to={way[0]} className="font-medium underline-offset-4 hover:underline">
            {way[1]}
          </Link>
        ) : null}
      </span>
    </nav>
  );
}
