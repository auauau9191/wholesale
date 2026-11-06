import { createFileRoute } from "@tanstack/react-router";
import LandingHero from "@/components/public/LandingHero";
import PromiseList from "@/components/public/PromiseList";
import PlanList from "@/components/public/PlanList";
import PlanLoading from "@/components/public/PlanLoading";
import ClosingCta from "@/components/public/ClosingCta";
import RouteStrip from "@/components/brand/RouteStrip";
import Reveal from "@/components/motion/Reveal";
import useAppSettings from "@/hooks/useAppSettings";
import { buildPlans, commissionPercent } from "@/lib/plans";

export const Route = createFileRoute("/_site/")({
  head: () => ({
    meta: [
      { title: "Wholesale System — See it. Touch it. Then order it." },
      {
        name: "description",
        content:
          "Chinese factories visited and filmed by our own team. Real samples sent from our hubs in Brisbane and Sydney before you order a single carton.",
      },
    ],
  }),
  component: LandingPage,
});

function LandingPage() {
  const { data: settings, isLoading } = useAppSettings();
  const plans = buildPlans(settings);
  const commission = commissionPercent(settings);

  return (
    <main>
      <LandingHero />

      <section className="mx-auto w-full max-w-[1180px] px-5 md:px-10">
        <Reveal>
          <RouteStrip />
        </Reveal>
      </section>

      <Reveal>
        <PromiseList />
      </Reveal>

      <Reveal>
        <section className="mx-auto w-full max-w-[1180px] px-5 py-14 md:px-10 md:py-20">
          <h2 className="text-section font-medium tracking-[-0.02em]">Plans</h2>
          <p className="mt-3 max-w-[560px] text-body text-ink-soft">
            One membership for your whole business. No fee on orders, ever.
          </p>
          <div className="mt-8">
            {isLoading ? <PlanLoading /> : null}
            {!isLoading && plans.length ? <PlanList plans={plans} /> : null}
            {!isLoading && !plans.length ? (
              <p className="max-w-[560px] text-body text-ink-soft">
                Plan prices are confirmed when you join.
              </p>
            ) : null}
          </div>
        </section>
      </Reveal>

      <Reveal>
        <section className="mx-auto w-full max-w-[1180px] px-5 pb-6 md:px-10">
          <div className="bg-paper p-6 md:p-8">
            <h2 className="text-lead font-medium">How we earn</h2>
            <p className="mt-3 max-w-[720px] text-body text-ink-soft">
              You pay the plan and nothing on orders. Inspection, freight, duty and GST
              are passed on at cost.{" "}
              {commission === null
                ? "Suppliers pay us a commission on the goods value and an annual listing fee."
                : `Suppliers pay us ${commission}% of the goods value and an annual listing fee.`}
            </p>
          </div>
        </section>
      </Reveal>

      <Reveal>
        <ClosingCta />
      </Reveal>
    </main>
  );
}