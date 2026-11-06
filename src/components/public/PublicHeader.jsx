import { Link } from "@tanstack/react-router";
import SampleTag from "@/components/brand/SampleTag";

export default function PublicHeader() {
  return (
    <header className="mx-auto flex w-full max-w-[1180px] items-center justify-between px-5 py-6 md:px-10 md:py-8">
      <Link to="/" className="flex items-center gap-3 text-ink">
        <SampleTag className="h-6 w-auto md:h-7" />
        <span className="text-lead font-medium tracking-[-0.01em]">Wholesale System</span>
      </Link>
      <nav className="flex items-center gap-6">
        <Link
          to="/join"
          className="text-body text-ink-soft underline-offset-4 hover:text-ink hover:underline"
        >
          Plans
        </Link>
        <Link
          to="/login"
          className="text-body text-ink underline-offset-4 hover:underline"
        >
          Sign in
        </Link>
      </nav>
    </header>
  );
}