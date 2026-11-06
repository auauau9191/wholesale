import { useState } from "react";
import { Link } from "@tanstack/react-router";
import SampleTag from "@/components/brand/SampleTag";
import NavList from "@/components/shell/NavList";
import PageFade from "@/components/motion/PageFade";

/**
 * The framed sheet: sidebar and a 48px top bar share one frame colour, and the
 * page is a white sheet inset 8px from the right and bottom.
 */
export default function AppFrame({ nav, brand, topBarRight, footer, bottomBar, children }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-frame text-app-ink">
      <div className="md:flex">
        <aside className="sticky top-0 hidden h-screen w-[244px] shrink-0 flex-col justify-between overflow-y-auto px-4 py-6 md:flex">
          <div>
            <Link to="/" className="flex items-center gap-2.5 px-1">
              <SampleTag className="h-5 w-auto" />
              <span className="text-body font-medium">Wholesale System</span>
            </Link>
            <div className="mt-7 px-1">{brand}</div>
            <NavList items={nav} className="mt-5" />
          </div>
          <div className="px-1 pt-8">{footer}</div>
        </aside>

        <div className="flex min-h-screen flex-1 flex-col">
          <div className="flex h-12 shrink-0 items-center gap-2 px-3 md:px-5">
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
              className="-ml-2 flex h-11 w-11 items-center justify-center rounded-control md:hidden"
            >
              <span className="flex flex-col gap-[5px]">
                <span className="block h-[1.5px] w-5 bg-app-ink" />
                <span className="block h-[1.5px] w-5 bg-app-ink" />
              </span>
            </button>
            <div className="ml-auto flex items-center gap-2">{topBarRight}</div>
          </div>

          <main className={`flex-1 px-2 ${bottomBar ? "pb-20 md:pb-2" : "pb-2"}`}>
            <div className="min-h-[calc(100dvh-64px)] rounded-sheet border border-sheet-edge bg-sheet px-4 py-6 md:px-8 md:py-8">
              <PageFade>{children}</PageFade>
            </div>
          </main>
        </div>
      </div>

      {bottomBar}

      {menuOpen ? (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-frame p-5 md:hidden">
          <div className="flex items-center justify-between">
            <Link
              to="/"
              className="flex items-center gap-2.5"
              onClick={() => setMenuOpen(false)}
            >
              <SampleTag className="h-5 w-auto" />
              <span className="text-body font-medium">Wholesale System</span>
            </Link>
            <button
              type="button"
              onClick={() => setMenuOpen(false)}
              className="min-h-[44px] rounded-control px-2 text-body text-app-meta"
            >
              Close
            </button>
          </div>
          <div className="mt-6">{brand}</div>
          <NavList
            items={nav}
            className="mt-4"
            large
            onNavigate={() => setMenuOpen(false)}
          />
          <div className="mt-8">{footer}</div>
        </div>
      ) : null}
    </div>
  );
}