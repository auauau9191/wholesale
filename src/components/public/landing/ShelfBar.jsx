import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

const EASE = [0.22, 1, 0.36, 1];

/** One category: a filled bar that opens to the samples waiting on the shelf. */
export default function ShelfBar({ category, open, onToggle }) {
  const reduce = useReducedMotion();

  return (
    <div>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex min-h-[52px] w-full items-center justify-between gap-4 bg-ink px-4 py-3 text-left text-lead text-ground transition-transform duration-150 active:scale-[0.99]"
      >
        <span className="truncate">{category.name}</span>
        <span aria-hidden="true" className="tabular">
          {open ? "−" : "+"}
        </span>
      </button>
      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            key="body"
            initial={reduce ? false : { height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={reduce ? {} : { height: 0, opacity: 0 }}
            transition={{ duration: 0.18, ease: EASE }}
            className="overflow-hidden"
          >
            <ul className="divide-y divide-ink/10 py-1">
              {category.products.map((product) => (
                <li key={product.name} className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 py-3">
                  <span className="text-lead">{product.name}</span>
                  <span className="tabular text-lead">from US${product.from.toFixed(2)}</span>
                  <span className="w-full text-body text-ink-soft">
                    Supplier {product.supplier} · MOQ {product.moq.toLocaleString("en-AU")}
                  </span>
                </li>
              ))}
              {category.products.length === 0 ? (
                <li className="py-3 text-body text-ink-soft">Samples are being shelved here now.</li>
              ) : null}
            </ul>
            <p className="pb-2 text-label text-ink-soft">
              {category.suppliers} verified {category.suppliers === 1 ? "supplier" : "suppliers"}
            </p>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}