import { useEffect, useRef, useState } from "react";

/**
 * Which of a set of blocks sits nearest the middle of the screen. Attach
 * `refs.current[index]` to each block; the answer follows the scroll.
 */
export default function useMiddleIndex(count, enabled = true) {
  const refs = useRef([]);
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (!enabled) return undefined;
    let frame = 0;

    const measure = () => {
      const middle = window.innerHeight / 2;
      let nearest = 0;
      let shortest = Infinity;
      refs.current.forEach((node, index) => {
        if (!node) return;
        const box = node.getBoundingClientRect();
        const distance = Math.abs(box.top + box.height / 2 - middle);
        if (distance < shortest) {
          shortest = distance;
          nearest = index;
        }
      });
      setActive(nearest);
    };

    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        measure();
      });
    };

    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [count, enabled]);

  return [active, refs];
}