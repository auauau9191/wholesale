import { useContext, useState } from "react";
import { cn } from "@/lib/utils";
import { PrintedContext } from "@/components/docket/Printer";
import { MARK_STAGGER_MS } from "@/lib/motion/docket-motion";
import Mark from "@/components/docket/Mark";

const money = (value) => `A$${Number(value || 0).toFixed(2)}`;

/**
 * A printed figure. `key={value}` remounts it when the value changes, so only the
 * figures that changed print again (the machine), and unchanged ones stay still.
 */
export function Printed({ value, className, children, reprint = true }) {
  return <PrintedFigure key={reprint ? String(value) : "static"} className={className} reprint={reprint}>{children ?? value}</PrintedFigure>;
}

function PrintedFigure({ className, children, reprint }) {
  // mounted after the docket printed = the value changed, so it reprints; mounted while feeding = part of the first print
  const printedAlready = useContext(PrintedContext);
  const [animate] = useState(reprint && printedAlready);
  return <span className={cn(animate && "dk-reprint", className)}>{children}</span>;
}

export function DocketHead({ left, right }) {
  return (
    <div className="dk-docket__head">
      <span>{left}</span>
      <span className="dk-num">{right}</span>
    </div>
  );
}

/**
 * One cost line: what it is, the amount, and the proof behind it on a tear-off stub.
 * The proof is ticked by our team (pen) once the docket has printed.
 */
export function DocketLine({ label, amount, proof, printed, index = 0 }) {
  return (
    <div className="dk-line">
      <span><Printed value={label} /></span>
      <span className="dk-line__amt"><Printed value={money(amount)} /></span>
      <span className="dk-stub">
        {proof ? <Mark kind="tick" play={printed} delay={index * MARK_STAGGER_MS} /> : null}
        {proof}
      </span>
    </div>
  );
}

/** The total, in the printer's red, circled by hand once the proof above it is ticked. */
export function DocketTotal({ amount, unit = "a unit", proof, printed, ringDelay = 600 }) {
  return (
    <div className="dk-total">
      <span>
        <span className="dk-total__figure dk-figure">
          <Printed value={money(amount)} />
          <Mark kind="ring" play={printed} delay={ringDelay} speed={0.9} />
        </span>
        <span className="dk-total__unit">{unit}</span>
      </span>
      {proof ? (
        <span className="dk-stub">
          <Mark kind="tick" play={printed} delay={ringDelay - MARK_STAGGER_MS} />
          {proof}
        </span>
      ) : <span />}
    </div>
  );
}

/** Label and amount on paper, no proof (membership, receipts). `red` marks money that adds up to you. */
export function DocketRow({ label, value, red = false }) {
  return (
    <div className={cn("dk-row", red && "dk-row--red")}>
      <span>{label}</span>
      <b><Printed value={value} /></b>
    </div>
  );
}

export { money };
