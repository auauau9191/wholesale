import { createFileRoute } from "@tanstack/react-router";
import { getLandingData } from "@/lib/landing-fns";
import Reveal from "@/components/motion/Reveal";
import HeroSplit from "@/components/public/landing/HeroSplit";
import Paperwork from "@/components/public/landing/Paperwork";
import RouteSection from "@/components/public/landing/RouteSection";
import Rules from "@/components/public/landing/Rules";
import Shelves from "@/components/public/landing/Shelves";
import Prices from "@/components/public/landing/Prices";
import Questions from "@/components/public/landing/Questions";
import SiteFooter from "@/components/public/landing/SiteFooter";

export const Route = createFileRoute("/_site/")({
  loader: () => getLandingData(),
  head: () => ({
    meta: [
      { title: "Wholesale System — hold the sample, then order 5,000" },
      {
        name: "description",
        content:
          "Chinese factories our team has visited and filmed. Their samples sit on a shelf in Australia, and every bulk order is locked to the sample you held.",
      },
    ],
  }),
  component: LandingPage,
});

function LandingPage() {
  const data = Route.useLoaderData();

  if (!data?.settings || !data?.product) {
    return (
      <main className="px-5 py-24 text-ink md:px-10">
        <h1 className="text-section font-medium">Wholesale System</h1>
        <p className="mt-3 max-w-[560px] text-lead text-ink-soft">
          The example catalogue and the settings this page reads are missing. Nothing here is
          invented to fill the gap.
        </p>
      </main>
    );
  }

  return (
    <main className="text-ink">
      <HeroSplit data={data} />
      <Reveal>
        <Paperwork data={data} />
      </Reveal>
      <RouteSection settings={data.settings} />
      <Reveal>
        <Rules settings={data.settings} />
      </Reveal>
      <Reveal>
        <Shelves shelves={data.shelves} />
      </Reveal>
      <Reveal>
        <Prices settings={data.settings} />
      </Reveal>
      <Reveal>
        <Questions settings={data.settings} />
      </Reveal>
      <SiteFooter data={data} />
    </main>
  );
}