import { createContext, useEffect, useLayoutEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { feedTiming, prefersReducedMotion, TEAR_MS } from "@/lib/motion/docket-motion";

/** True once the docket around it has finished printing. Figures that mount after that are changes, so they reprint. */
export const PrintedContext = createContext(false);

const useIsoLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

/**
 * The printer: a slot, and a docket feeding out of it.
 *
 * `printKey` names what is printed. When it changes, the old docket tears off (you) and the new one
 * feeds out of the slot in line steps (the machine). `children` is a function of the phase, so the
 * docket's marks can wait until it has printed: children({ printed }).
 *
 * The first paint is already feeding in CSS, so the page prints on load even before scripts run.
 */
export default function Printer({ printKey, children, copies = true, className, label }) {
  const docketRef = useRef(null);
  const [shownKey, setShownKey] = useState(printKey);
  const [phase, setPhase] = useState("feeding"); // feeding | printed | tearing
  const [timing, setTiming] = useState({ steps: 14, ms: 900 });
  const first = useRef(true);
  const lastPrinted = useRef(null);

  // While the old docket tears off it must keep showing what was printed on it, not the next product.
  const replacing = printKey !== shownKey;
  const content = replacing && lastPrinted.current
    ? lastPrinted.current
    : children({ printed: phase === "printed", printKey: shownKey });
  if (!replacing) lastPrinted.current = content;

  // measure the docket so the feed takes one step per printed line
  useIsoLayoutEffect(() => {
    if (docketRef.current) setTiming(feedTiming(docketRef.current.offsetHeight));
  }, [shownKey]);

  // after a feed, the docket is printed
  useEffect(() => {
    if (phase !== "feeding") return undefined;
    const t = setTimeout(() => setPhase("printed"), prefersReducedMotion() ? 0 : timing.ms);
    return () => clearTimeout(t);
  }, [phase, timing.ms, shownKey]);

  // a new key: tear the old docket off, then feed the new one
  useEffect(() => {
    if (first.current) { first.current = false; return undefined; }
    if (printKey === shownKey) return undefined;
    setPhase("tearing");
    const t = setTimeout(() => { setShownKey(printKey); setPhase("feeding"); }, prefersReducedMotion() ? 0 : TEAR_MS);
    return () => clearTimeout(t);
  }, [printKey]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className={cn("dk-printer", phase === "feeding" && "is-printing", phase === "printed" && "is-printed", className)}>
      <div className="dk-printer__slot" aria-hidden="true"><span className="dk-printer__led" /></div>
      <div className="dk-printer__feed">
        {copies ? (
          <div className="dk-printer__copies" aria-hidden="true">
            <div className="dk-printer__copy dk-printer__copy--2" />
            <div className="dk-printer__copy dk-printer__copy--1" />
          </div>
        ) : null}
        <div
          ref={docketRef}
          key={shownKey}
          className={cn("dk-paper dk-zig-b dk-docket", phase === "feeding" && "is-feeding", phase === "tearing" && "is-tearing")}
          style={{ "--steps": timing.steps, "--feed": `${timing.ms}ms` }}
          aria-live="polite"
          aria-label={label}
        >
          <PrintedContext.Provider value={phase === "printed" && !replacing}>
            {content}
          </PrintedContext.Provider>
        </div>
      </div>
    </div>
  );
}
