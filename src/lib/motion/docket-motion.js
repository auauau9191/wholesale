import { useEffect, useState } from "react";

/**
 * Docket motion helpers. The grammar lives in DESIGN.md:
 *   print (the machine), mark (our team), tear (you). Nothing else moves.
 */

/** Print time for one line, ms. Matches --dk-line in src/styles/docket.css. */
export const LINE_MS = 64;
/** How long a tear takes before the next thing happens, ms. */
export const TEAR_MS = 420;
/** Gap between consecutive pen marks, ms. */
export const MARK_STAGGER_MS = 110;

export function prefersReducedMotion() {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Reduced-motion preference as state (false on the server, so the first paint matches). */
export function useReducedMotionPref() {
  const [reduce, setReduce] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduce(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return reduce;
}

/** Wait, or don't, when the visitor asked for less motion. */
export const wait = (ms) => new Promise((resolve) => setTimeout(resolve, prefersReducedMotion() ? 0 : ms));

/** How long a docket of this height takes to feed out of the slot, and in how many steps. */
export function feedTiming(heightPx) {
  const steps = Math.max(8, Math.round((heightPx || 480) / 34));
  return { steps, ms: steps * LINE_MS };
}

/** Restart a CSS animation on an element (used to reprint a figure). */
export function replay(el, className) {
  if (!el) return;
  el.classList.remove(className);
  void el.offsetWidth;
  el.classList.add(className);
}

let lottiePromise = null;
/** lottie-web's light SVG player, loaded once, only when a mark is first needed. */
export function loadLottie() {
  if (!lottiePromise) {
    lottiePromise = import("lottie-web/build/player/lottie_light").then((m) => m.default ?? m);
  }
  return lottiePromise;
}
