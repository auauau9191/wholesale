import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import JoinProgress from "@/components/public/join/JoinProgress";
import PlanStep from "@/components/public/join/PlanStep";
import BusinessStep from "@/components/public/join/BusinessStep";
import ReviewStep from "@/components/public/join/ReviewStep";
import PlanLoading from "@/components/public/PlanLoading";
import PublicHeader from "@/components/public/PublicHeader";
import PublicFooter from "@/components/public/PublicFooter";
import DataBlock from "@/components/shell/DataBlock";
import MembershipPending from "@/components/public/MembershipPending";
import useAppSettings from "@/hooks/useAppSettings";
import useMemberProfile from "@/hooks/useMemberProfile";
import { useAuth } from "@/lib/AuthContext";
import { buildPlans, planPriceAud } from "@/lib/plans";
import { isValidAbn } from "@/lib/abn";
import { registerMember } from "@/lib/member-fns";
import { returnToSearch } from "@/lib/authReturnTo";

const DRAFT_KEY = "wholesale-join-draft";

const EMPTY_FORM = {
  business_name: "",
  abn: "",
  mobile: "",
  street: "",
  suburb: "",
  state: "QLD",
  postcode: "",
};

const PRIMARY =
  "inline-flex min-h-[52px] items-center rounded-none bg-ink px-8 text-lead font-medium text-paper transition-transform duration-150 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-40";

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
  const { user, isAuthenticated, isLoadingAuth } = useAuth();
  const submitMember = useServerFn(registerMember);
  const { profile: existingProfile, loading: profileLoading } = useMemberProfile(
    isAuthenticated ? user?.email : null
  );

  const plans = buildPlans(settings);
  const [step, setStep] = useState(1);
  const [plan, setPlan] = useState("starter_quarter");
  const [form, setForm] = useState(EMPTY_FORM);
  const [terms, setTerms] = useState(false);
  const [profile, setProfile] = useState(null);

  const mutation = useMutation({
    mutationFn: (payload) => submitMember({ data: payload }),
    onSuccess: (created) => {
      sessionStorage.removeItem(DRAFT_KEY);
      setProfile(created);
    },
  });

  // A visitor who has to register first comes back to the answers they typed.
  useEffect(() => {
    try {
      const saved = JSON.parse(sessionStorage.getItem(DRAFT_KEY) || "null");
      if (saved?.form) setForm({ ...EMPTY_FORM, ...saved.form });
      if (saved?.plan) setPlan(saved.plan);
      if (saved?.step) setStep(Math.min(Math.max(saved.step, 1), 3));
    } catch {
      sessionStorage.removeItem(DRAFT_KEY);
    }
  }, []);

  useEffect(() => {
    if (profile) return;
    sessionStorage.setItem(DRAFT_KEY, JSON.stringify({ form, plan, step }));
  }, [form, plan, step, profile]);

  const update = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  const abnDigits = form.abn.replace(/\D/g, "");
  const businessComplete =
    form.business_name.trim().length > 1 &&
    isValidAbn(abnDigits) &&
    form.mobile.replace(/\D/g, "").length >= 8 &&
    form.street.trim().length > 2 &&
    form.suburb.trim().length > 1 &&
    /^\d{4}$/.test(form.postcode);

  const selectedPlan = plans.find((option) => option.key === plan) ?? null;

  const handleSubmit = () => {
    mutation.mutate({
      plan,
      business_name: form.business_name.trim(),
      abn: abnDigits,
      mobile: form.mobile.trim(),
      street: form.street.trim(),
      suburb: form.suburb.trim(),
      state: form.state,
      postcode: form.postcode.trim(),
      terms_accepted: terms,
    });
  };

  // An account that already applied always sees where its membership stands.
  const application = profile ?? existingProfile;

  if (application) {
    return (
      <main className="mx-auto w-full max-w-[820px] px-5 pb-16 pt-6 md:px-10 md:pt-10">
        <MembershipPending profile={application} price={planPriceAud(settings, application.plan)} />
      </main>
    );
  }

  if (profileLoading) {
    return (
      <main className="mx-auto w-full max-w-[820px] px-5 pb-16 pt-6 md:px-10 md:pt-10">
        <DataBlock state="loading" />
      </main>
    );
  }

  return (
    <div>
      <PublicHeader />
      <main className="mx-auto w-full max-w-[820px] px-5 pb-16 pt-4 md:px-10 md:pt-8">
      <h1 className="max-w-[600px] text-section font-medium tracking-[-0.02em]">
        Join, then hold the product in your hands.
      </h1>

      <div className="mt-7">
        <JoinProgress step={step} />
      </div>

      <section className="mt-9">
        {step === 1 && isLoading ? <PlanLoading /> : null}

        {step === 1 && !isLoading ? (
          <PlanStep
            plans={plans}
            plan={plan}
            onSelect={setPlan}
            footnote={
              settings
                ? `After 3 months the price becomes A$${settings.monthly_price_aud}/month. We email you 7 days before.`
                : null
            }
          />
        ) : null}

        {step === 2 ? <BusinessStep form={form} onChange={update} /> : null}

        {step === 3 ? (
          <ReviewStep
            planName={selectedPlan?.name ?? "Plan"}
            planPrice={selectedPlan?.price ?? "—"}
            form={form}
            sampleFee={settings?.sample_fee_aud}
            terms={terms}
            onTerms={setTerms}
            error={mutation.error ? mutation.error.message : null}
          />
        ) : null}
      </section>

      <div className="mt-10 flex flex-wrap items-center gap-6">
        {step > 1 ? (
          <button
            type="button"
            onClick={() => setStep(step - 1)}
            className="min-h-[44px] text-body text-ink-soft underline-offset-4 hover:text-ink hover:underline"
          >
            Back
          </button>
        ) : null}

        {step === 1 ? (
          <button type="button" onClick={() => setStep(2)} className={PRIMARY}>
            Continue
          </button>
        ) : null}

        {step === 2 ? (
          <button
            type="button"
            onClick={() => setStep(3)}
            disabled={!businessComplete}
            className={PRIMARY}
          >
            Continue
          </button>
        ) : null}

        {step === 3 && !isLoadingAuth && isAuthenticated ? (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!terms || mutation.isPending}
            className={PRIMARY}
          >
            {mutation.isPending ? "Sending your details" : "Join and pay"}
          </button>
        ) : null}

        {step === 3 && !isLoadingAuth && !isAuthenticated ? (
          <Link to="/register" search={returnToSearch("/join")} className={PRIMARY}>
            Create your account to finish
          </Link>
        ) : null}
      </div>

      {step === 3 && !isLoadingAuth && !isAuthenticated ? (
        <p className="mt-4 max-w-[560px] text-body text-ink-soft">
          Membership sits on an account. Your answers stay on this device while you register,
          then you come straight back here.
        </p>
      ) : null}
      </main>
      <PublicFooter />
    </div>
  );
}