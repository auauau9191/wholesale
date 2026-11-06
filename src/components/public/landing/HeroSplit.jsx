import useMiddleIndex from "@/hooks/useMiddleIndex";
import Crossfade from "@/components/motion/Crossfade";
import { formatDayMonthYear } from "@/lib/format";
import LandingNav from "@/components/public/landing/LandingNav";
import HeroCopy from "@/components/public/landing/HeroCopy";
import Statements from "@/components/public/landing/Statements";
import SampleTagCard from "@/components/public/landing/SampleTagCard";
import FilmCard from "@/components/public/landing/FilmCard";
import SampleTracker from "@/components/public/landing/SampleTracker";
import OrderCard from "@/components/public/landing/OrderCard";

function Panel({ index, pieces, bars }) {
  return (
    <div className="flex h-full flex-col bg-ink text-ground">
      <div className="relative min-h-0 flex-1">
        <Crossfade stateKey={index} duration={1.6} fill>
          <div className="flex h-full items-center justify-center overflow-y-auto p-5 md:p-8">
            {pieces[index]}
          </div>
        </Crossfade>
      </div>
      <div className="flex shrink-0 items-center justify-between gap-3 bg-ground px-4 py-2.5 text-label text-ink">
        <span className="truncate">{bars[index][0]}</span>
        <span className="shrink-0 text-ink-soft">{bars[index][1]}</span>
      </div>
    </div>
  );
}

/** The opening split: the claim on the left, one olive panel on the right. */
export default function HeroSplit({ data }) {
  const [active, refs] = useMiddleIndex(4);
  const { settings, unit, spec, supplier } = data;
  const pieces = [
    <SampleTagCard key="tag" data={data} />,
    <FilmCard key="film" data={data} />,
    <SampleTracker key="tracker" data={data} />,
    <OrderCard key="order" data={data} />,
  ];
  const shelfLine = unit ? `Unit ${unit.label} · shelf ${unit.shelf}, Australia` : "Unit · shelf, Australia";
  const shipLine = `Ships in ${settings.dispatchDays} business days`;
  const bars = [
    [shelfLine, shipLine],
    [supplier ? `Supplier ${supplier.code} · ${supplier.city}` : "Supplier", `Filmed ${formatDayMonthYear(supplier?.filmed)}`],
    [shelfLine, shipLine],
    ["Order WS-0142", `Locked to unit ${unit?.label ?? "—"} · spec ${spec?.rev ?? "—"}`],
  ];

  return (
    <section id="how-it-works">
      <div className="px-5 md:hidden">
        <LandingNav />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2">
        <div className="md:col-start-2 md:row-start-1">
          <div className="h-[40vh] md:sticky md:top-3 md:h-[calc(100vh-24px)]">
            <div className="h-full md:hidden">
              <Panel index={0} pieces={pieces} bars={bars} />
            </div>
            <div className="hidden h-full md:block">
              <Panel index={active} pieces={pieces} bars={bars} />
            </div>
          </div>
        </div>

        <div className="px-5 md:col-start-1 md:row-start-1 md:px-10">
          <div className="hidden md:block">
            <LandingNav />
          </div>
          <div
            ref={(node) => {
              refs.current[0] = node;
            }}
            className="flex flex-col justify-center py-8 md:min-h-[calc(100vh-72px)] md:py-0"
          >
            <HeroCopy price={settings.starterPrice} />
          </div>
          <Statements settings={settings} refs={refs} pieces={pieces} />
        </div>
      </div>
    </section>
  );
}