import { Link } from "@tanstack/react-router";
import SampleTag from "@/components/brand/SampleTag";
import SampleTagCard from "@/components/public/landing/SampleTagCard";

const MENU = [
  ["How it works", "#how-it-works"],
  ["The paperwork", "#paperwork"],
  ["The route", "#route"],
  ["Shelves", "#shelves"],
  ["Prices", "#prices"],
  ["Questions", "#questions"],
];

/** The close: the tag cropped large, and the menu in olive. */
export default function SiteFooter({ data }) {
  return (
    <footer className="grid md:grid-cols-2">
      <div className="relative h-[300px] overflow-hidden bg-ground md:h-auto md:min-h-[620px]">
        <div className="absolute left-1/2 top-1/2 w-[104%] -translate-x-1/2 -translate-y-1/2 rotate-[-6deg]">
          <SampleTagCard data={data} />
        </div>
      </div>

      <div className="bg-ink px-5 py-12 text-ground md:px-10 md:py-16">
        <div className="flex items-center gap-2">
          <SampleTag tone="ground" className="h-5 w-auto" />
          <span className="text-body font-medium">Wholesale System</span>
        </div>

        <nav className="mt-8 flex flex-col items-start">
          {MENU.map(([label, href]) => (
            <a
              key={href}
              href={href}
              className="text-[24px] leading-[1.3] underline-offset-4 hover:underline md:text-section md:leading-[1.25]"
            >
              {label}
            </a>
          ))}
          <Link
            to="/join"
            className="text-[24px] leading-[1.3] underline-offset-4 hover:underline md:text-section md:leading-[1.25]"
          >
            Join
          </Link>
        </nav>

        <div className="mt-10 max-w-[440px] space-y-3 text-body leading-[22px] text-ground/70">
          <p>Members: Help from inside the app, within one business day.</p>
          <p>Factories: Want to be listed? Ask for a visit; we film and score you first.</p>
          <p>
            Wholesale System is a working name. Prices are in Australian dollars. Sample products,
            suppliers and figures on this page are examples. The footage is illustrative stock, not
            our suppliers or our hubs.
          </p>
        </div>
      </div>
    </footer>
  );
}