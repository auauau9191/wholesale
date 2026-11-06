import { motion, useReducedMotion } from "framer-motion";

const KIND = {
  master: "border-app-ink bg-app-ink",
  pack: "border-data bg-data",
  shelf: "border-data bg-sheet",
  out: "border-control bg-control",
  retired: "border-dashed border-control bg-sheet",
};

export const SHELF_KEY = [
  ["master", "Master, stays"],
  ["pack", "Pack today"],
  ["shelf", "On the shelf"],
  ["out", "With a member"],
  ["retired", "Retired"],
];

export function ShelfMark({ kind }) {
  return <span className={`inline-block h-[18px] w-[13px] rounded-[3px] border-2 ${KIND[kind]}`} aria-hidden="true" />;
}

/** Each unit of a product as one mark. */
export default function ShelfStrip({ marks }) {
  const reduce = useReducedMotion();
  return (
    <div className="flex flex-wrap gap-1" role="img" aria-label={`${marks.length} units`}>
      {marks.map((mark) => (
        <motion.span
          key={mark.unit_id}
          layout
          transition={{ duration: reduce ? 0 : 0.18, ease: [0.22, 1, 0.36, 1] }}
          title={mark.unit_id}
          className="inline-flex"
        >
          <ShelfMark kind={mark.kind} />
        </motion.span>
      ))}
    </div>
  );
}