import { createFileRoute, Link } from "@tanstack/react-router";
import PlanList from "@/components/public/PlanList";
import PlanLoading from "@/components/public/PlanLoading";
import useAppSettings from "@/hooks/useAppSettings";
import { buildPlans } from "@/lib/plans";

export const Route = createFileRoute("/_site/join")({
  head: () => ({
    meta: [
      { title: "Join · Wholesale System" },
      {
        name: "description",
        content:
          "Membership for Australian businesses: one free sample, real units from our Brisbane and Sydney hubs, and bulk orders locked to the sample you approved.",
      },
    ],
  }),
  component: JoinPage,
});

function JoinPage() {
  const { data: settings, isLoading } = useAppSettings();
  const plans = buildPlans(settings);

  return (
    <main className="mx-auto w-full max-w-[1180px] px-5 pb-10 md:px-10">
      <h1 className="max-w-[760px] text-display font-medium tracking-[-0.03em]">
        Join, then hold the product in your hands.
      </h1>
      <p className="mt-6 max-w-[560px] text-lead text-ink-soft">
        Membership is for Australian businesses with an ABN. One free sample per ABN, for
        life.
      </p>

      <section className="mt-12">
        <h2 className="text-section font-medium tracking-[-0.02em]">Choose a plan</h2>
        <div className="mt-6">
          {isLoading ? <PlanLoading /> : null}
          {!isLoading && plans.length ? <PlanList plans={plans} /> : null}
          {!isLoading && !plans.length ? (
            <p className="max-w-[560px] text-body text-ink-soft">
              Plan prices are confirmed when you join.
            </p>
          ) : null}
        </div>
        {settings ? (
          <p className="mt-4 max-w-[620px] text-body text-ink-soft">
            After the first 3 months the price becomes A${settings.monthly_price_aud} a
            month. We email you 7 days before any change.
          </p>
        ) : null}
      </section>

      <section className="mt-12">
        <h2 className="text-section font-medium tracking-[-0.02em]">Your ABN</h2>
        <p className="mt-4 max-w-[620px] text-body text-ink-soft">
          Your ABN is checked when your account is reviewed, and it stays linked to your
          free sample. A business that cancels and rejoins keeps the same sample record.
        </p>
      </section>

      <div className="mt-12">
        <Link
          to="/register"
          className="inline-flex min-h-[52px] items-center rounded-none bg-ink px-8 text-lead font-medium text-paper transition-transform duration-150 active:scale-[0.97]"
        >
          Create your account
        </Link>
        <p className="mt-4 text-body text-ink-soft">
          Already a member?{" "}
          <Link to="/login" className="text-ink underline-offset-4 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}