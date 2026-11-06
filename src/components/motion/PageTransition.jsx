import { useEffect, useRef } from "react";
import { motion, useAnimationControls, useReducedMotion } from "framer-motion";
import { useLocation } from "@tanstack/react-router";

const EASE = [0.22, 1, 0.36, 1];

/**
 * Page change: fade plus an 8px rise, 200ms, around the router outlet. The
 * first paint is left alone so the opening screen is never waiting on it.
 */
export default function PageTransition({ children }) {
  const reduce = useReducedMotion();
  const controls = useAnimationControls();
  const { pathname } = useLocation();
  const first = useRef(true);

  useEffect(() => {
    if (reduce) {
      controls.set({ opacity: 1, y: 0 });
      return;
    }
    if (first.current) {
      first.current = false;
      return;
    }
    controls.set({ opacity: 0, y: 8 });
    controls.start({ opacity: 1, y: 0, transition: { duration: 0.2, ease: EASE } });
  }, [pathname, reduce, controls]);

  return (
    <motion.div initial={false} animate={controls}>
      {children}
    </motion.div>
  );
}