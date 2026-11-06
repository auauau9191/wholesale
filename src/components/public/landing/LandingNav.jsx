import { Link } from "@tanstack/react-router";
import SampleTag from "@/components/brand/SampleTag";

/** The landing nav: how it works, the mark, prices. */
export default function LandingNav() {
  return (
    <nav className="grid grid-cols-3 items-center gap-4 py-4 text-body text-ink">
      <a href="#how-it-works" className="justify-self-start underline-offset-4 hover:underline">
        How it works
      </a>
      <Link to="/" className="flex items-center gap-2 justify-self-center" aria-label="Wholesale System, home">
        <SampleTag className="h-5 w-auto" />
        <span className="font-medium">Wholesale System</span>
      </Link>
      <a href="#prices" className="justify-self-end underline-offset-4 hover:underline">
        Prices
      </a>
    </nav>
  );
}