import useMiddleIndex from "@/hooks/useMiddleIndex";
import Crossfade from "@/components/motion/Crossfade";
import Clip from "@/components/public/landing/Clip";

function Hubs({ rows }) {
  return (
    <div className="mt-4 max-w-[420px] divide-y divide-ink/15 text-body">
      {rows.map(([region, hub]) => (
        <div key={region} className="grid grid-cols-2 gap-4 py-2">
          <span className="text-ink-soft">{region}</span>
          <span>{hub}</span>
        </div>
      ))}
    </div>
  );
}

/** The route every product takes, with the clip for the stop nearest the middle. */
export default function RouteSection({ settings }) {
  const [active, refs] = useMiddleIndex(5);
  const stops = [
    {
      name: "Factory floor, China",
      clip: "hero-china-factory-aerial",
      body: "We shortlist factories that already export, in the cities where each category is made, and list only the ones that let us in.",
    },
    {
      name: "Verified on our own film",
      clip: "factory-operator",
      body: "Our team visits in person and films the gate, the lines, the quality bench and the owner, holding a board dated that day. Then we seal a reference sample with the factory.",
    },
    {
      name: "Containers to Australia",
      clip: "transit-conveyor-rollers",
      body: "Sample units travel together in one consolidated shipment. Bulk orders sail on their own, with the inspection report and the ChAFTA certificate attached.",
    },
    {
      name: "Two hubs: Brisbane and Sydney",
      clip: "hub-qc-check",
      body: "Each hub checks every unit that arrives against the sealed master, then shelves it with its tag. Brisbane is run by Yusuf, Sydney by our partner.",
      hubs: [
        ["QLD, NT", "Brisbane"],
        ["NSW, ACT", "Sydney"],
        ["VIC, TAS, SA, WA", "Sydney, else Brisbane"],
      ],
    },
    {
      name: "Your door, anywhere in Australia",
      clip: "hub-sample-picker",
      body: `The nearest hub with the unit in stock sends your sample within ${settings.dispatchDays} business days. Bulk orders come through the hub, or straight from the port when they fill a container.`,
    },
  ];

  return (
    <section id="route">
      <div className="mx-auto w-full max-w-[1440px] px-5 md:px-10">
        <h2 className="max-w-[720px] text-[30px] font-medium leading-[1.1] tracking-[-0.02em] md:text-section">
          Factory floor to your door
        </h2>
      </div>

      <div className="mt-8 grid grid-cols-1 md:mt-10 md:grid-cols-2">
        <div className="md:col-start-2 md:row-start-1">
          <div className="hidden md:block md:sticky md:top-3 md:h-[calc(100vh-24px)]">
            <div className="flex h-full flex-col bg-ink">
              <div className="relative min-h-0 flex-1">
                <Crossfade stateKey={active} duration={0.9} className="absolute inset-0">
                  <Clip name={stops[active].clip} className="h-full w-full" />
                </Crossfade>
              </div>
              <div className="flex shrink-0 items-center justify-between gap-3 bg-ground px-4 py-2.5 text-label text-ink">
                <span className="truncate">{stops[active].name}</span>
                <span className="shrink-0 text-ink-soft">Illustrative footage</span>
              </div>
            </div>
          </div>
        </div>

        <div className="px-5 md:col-start-1 md:row-start-1 md:px-10">
          {stops.map((stop, index) => (
            <div
              key={stop.name}
              ref={(node) => {
                refs.current[index] = node;
              }}
              className="flex min-h-[60vh] flex-col justify-center py-10 md:py-12"
            >
              <h3 className="max-w-[440px] text-[24px] font-medium leading-[1.12] tracking-[-0.02em] md:text-section md:leading-[1.1]">
                {stop.name}
              </h3>
              <p className="mt-3 max-w-[440px] text-lead leading-[26px] text-ink-soft">{stop.body}</p>
              {stop.hubs ? <Hubs rows={stop.hubs} /> : null}
              <div className="mt-6 md:hidden">
                <Clip name={stop.clip} className="aspect-[16/10] w-full" />
                <p className="mt-2 text-label text-ink-soft">Illustrative footage</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}