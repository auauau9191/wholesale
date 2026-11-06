import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

const EASE = [0.22, 1, 0.36, 1];

/**
 * Crossfades between states: one layer leaves as the next arrives. Pass `fill`
 * when the crossfade covers a positioned parent, otherwise it sizes to its own
 * contents.
 */
export default function Crossfade({ stateKey, duration = 1.6, fill = false, className = "", children }) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;

  return (
    <div className={`${fill ? "absolute inset-0" : "relative"} ${className}`}>
      <AnimatePresence initial={false}>
        <motion.div
          key={stateKey}
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration, ease: EASE }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}