import { Link } from "@tanstack/react-router";
import DataBlock from "@/components/shell/DataBlock";

/** Two columns on a phone, four from 1024px. */
export default function CategoryGrid({ categories, counts }) {
  if (!categories.length) {
    return (
      <DataBlock
        title="No categories are live yet."
        note="Categories open as the catalogue grows."
      />
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {categories.map((category) => {
        const total = counts[category.code] ?? 0;
        return (
          <Link
            key={category.code}
            to="/category"
            search={{ code: category.code }}
            className="flex min-h-[132px] flex-col justify-between rounded-card border border-edge bg-sheet p-4 transition-colors hover:border-control"
          >
            <span className="tabular inline-flex h-6 w-fit items-center rounded-control bg-pill-green px-2 text-label text-pill-green-ink">
              {category.code}
            </span>
            <span className="mt-4 block text-body font-medium leading-snug">
              {category.name}
            </span>
            <span className="mt-1 block text-label text-app-meta">
              {total} verified suppliers
            </span>
          </Link>
        );
      })}
    </div>
  );
}