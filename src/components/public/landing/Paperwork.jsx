import { useState } from "react";
import LandedSheet from "@/components/public/landing/LandedSheet";
import FactoryReportSheet from "@/components/public/landing/FactoryReportSheet";
import SpecSheet from "@/components/public/landing/SpecSheet";
import InspectionSheet from "@/components/public/landing/InspectionSheet";

const TABS = ["Landed cost", "Factory report", "Spec sheet", "Inspection"];

/** Four documents, one sheet: the paperwork behind an order. */
export default function Paperwork({ data }) {
  const [tab, setTab] = useState(0);

  return (
    <section id="paperwork" className="mx-auto w-full max-w-[1440px] px-5 py-16 md:px-10 md:py-28">
      <h2 className="max-w-[760px] text-[30px] font-medium leading-[1.1] tracking-[-0.02em] md:text-section">
        The paperwork behind every order
      </h2>
      <p className="mt-3 max-w-[620px] text-lead leading-[26px] text-ink-soft">
        Every product page carries these four, for the same unit you can hold. Pick a quantity on
        the first one to see what a case really costs you in Australia.
      </p>

      <div className="mt-10 grid gap-10 md:mt-14 md:grid-cols-[minmax(0,0.42fr)_minmax(0,1fr)] md:gap-16">
        <div className="flex flex-col items-start gap-1">
          {TABS.map((label, index) => (
            <button
              key={label}
              type="button"
              onClick={() => setTab(index)}
              aria-pressed={tab === index}
              className={`flex min-h-[44px] items-center text-left text-[24px] leading-[1.2] tracking-[-0.02em] md:text-section ${
                tab === index ? "text-ink" : "text-ink-soft hover:text-ink"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div>
          {tab === 0 ? <LandedSheet data={data} /> : null}
          {tab === 1 ? <FactoryReportSheet data={data} /> : null}
          {tab === 2 ? <SpecSheet data={data} /> : null}
          {tab === 3 ? <InspectionSheet data={data} /> : null}
        </div>
      </div>
    </section>
  );
}