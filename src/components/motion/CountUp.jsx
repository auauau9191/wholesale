import { useEffect, useRef, useState } from "react";
import { animate, useReducedMotion } from "framer-motion";

const EASE = [0.22, 1, 0.36, 1];

/** A number that counts to its new value in 400ms, in tabular figures. */
export default function CountUp({ value, format = (n) => String(n), className = "" }) {
  const reduce = useReducedMotion();
  const target = Number(value) || 0;
  const [shown, setShown] = useState(target);
  const previous = useRef(target);

  useEffect(() => {
    if (reduce) {
      previous.current = target;
      setShown(target);
      return undefined;
    }
    const controls = animate(previous.current, target, {
      duration: 0.4,
      ease: EASE,
      onUpdate: (next) => setShown(next),
    });
    previous.current = target;
    return () => controls.stop();
  }, [target, reduce]);

  return <span className={`tabular ${className}`}>{format(shown)}</span>;
}