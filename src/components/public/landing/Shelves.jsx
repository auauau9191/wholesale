import { useState } from "react";
import ShelfBar from "@/components/public/landing/ShelfBar";

/** The shelves: one giant word, ten categories, the samples inside them. */
export default function Shelves({ shelves }) {
  const [open, setOpen] = useState(shelves[0]?.code ?? null);
  const half = Math.ceil(shelves.length / 2);
  const columns = [shelves.slice(0, half), shelves.slice(half)];

  return (
    <section id="shelves" className="mx-auto w-full max-w-[1440px] px-5 py-16 md:px-10 md:py-24">
      <h2 className="text-[clamp(72px,24vw,340px)] font-medium leading-[0.82] tracking-[-0.045em]">
        Shelves
      </h2>
      <p className="mt-5 max-w-[620px] text-lead leading-[26px] text-ink-soft">
        Ten categories open at launch, twenty verified suppliers in each, and room for a hundred.
        A few of the samples waiting now:
      </p>

      <div className="mt-10 grid gap-x-8 gap-y-2 md:grid-cols-2">
        {columns.map((column, index) => (
          <div key={index} className="space-y-2">
            {column.map((category) => (
              <ShelfBar
                key={category.code}
                category={category}
                open={open === category.code}
                onToggle={() => setOpen(open === category.code ? null : category.code)}
              />
            ))}
          </div>
        ))}
      </div>

      <p className="mt-8 max-w-[620px] text-body text-ink-soft">
        New categories open after each round of factory visits; members hear first and can ask for
        one.
      </p>
    </section>
  );
}