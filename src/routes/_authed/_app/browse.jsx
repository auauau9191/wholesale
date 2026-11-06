import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import useMemberProfile from "@/hooks/useMemberProfile";
import CreditCard from "@/components/member/CreditCard";
import CatalogueSearch from "@/components/member/CatalogueSearch";
import CategoryGrid from "@/components/member/CategoryGrid";
import DataBlock from "@/components/shell/DataBlock";
import { listLiveCategories, listLiveSuppliers } from "@/services/catalogService";
import { listMyCredits } from "@/services/memberService";

export const Route = createFileRoute("/_authed/_app/browse")({
  head: () => ({ meta: [{ title: "Browse · Wholesale System" }] }),
  component: BrowsePage,
});

function BrowsePage() {
  const { user } = Route.useRouteContext();
  const { profile } = useMemberProfile(user?.email);

  const { data: categories = [], isLoading: categoriesLoading } = useQuery({
    queryKey: ["categories-live"],
    queryFn: listLiveCategories,
  });

  const { data: suppliers = [], isLoading: suppliersLoading } = useQuery({
    queryKey: ["suppliers-live"],
    queryFn: () => listLiveSuppliers(),
  });

  const { data: credits = [] } = useQuery({
    queryKey: ["browse-credits", user?.email],
    queryFn: () => listMyCredits(user.email, 50),
    enabled: Boolean(user?.email),
  });

  const balance = credits.reduce((total, entry) => total + (Number(entry.change) || 0), 0);

  // Live suppliers per category, counted from the supplier rows themselves.
  const counts = suppliers.reduce((tally, supplier) => {
    (supplier.category_codes ?? []).forEach((code) => {
      tally[code] = (tally[code] ?? 0) + 1;
    });
    return tally;
  }, {});

  return (
    <div className="space-y-6">
      <div>
        <p className="text-body text-app-meta">G&apos;day, {profile?.business_name || "there"}</p>
        <h1 className="mt-1 text-title font-medium tracking-[-0.01em]">What are you sourcing?</h1>
      </div>

      <CreditCard balance={balance} />

      <CatalogueSearch />

      <section>
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-lead font-medium">Categories</h2>
          <p className="tabular text-label text-app-meta">
            {categories.filter((category) => category.is_live).length} live
          </p>
        </div>
        <div className="mt-3">
          {categoriesLoading || suppliersLoading ? (
            <DataBlock state="loading" />
          ) : (
            <CategoryGrid categories={categories} counts={counts} />
          )}
        </div>
      </section>
    </div>
  );
}