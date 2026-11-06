import { Link } from "@tanstack/react-router";

/**
 * The one pending screen: shown after joining and to a signed-in member whose
 * membership is not active or not paid up yet.
 */
export default function MembershipPending({ profile, price, variant = "site" }) {
  const headingClass =
    variant === "app"
      ? "text-title font-medium tracking-[-0.01em]"
      : "text-section font-medium tracking-[-0.02em]";
  const boxClass =
    variant === "app" ? "rounded-card border border-edge bg-paper p-5" : "bg-paper p-6";
  const noteClass = variant === "app" ? "text-body text-app-meta" : "text-body text-ink-soft";

  const sentence = !profile
    ? "This account has no membership application yet. The three steps take about two minutes."
    : profile.status === "on_hold"
      ? "This ABN is already registered to another account, so we are checking it before we activate you."
      : "We have your details. Pay for your plan and we switch on samples and ordering.";

  const amount =
    price === null || price === undefined ? "Your plan amount" : `A$${price}`;

  return (
    <div className="max-w-[640px]">
      <h1 className={headingClass}>Membership pending</h1>
      <p className={`mt-3 text-body ${variant === "app" ? "text-app-meta" : "text-ink-soft"}`}>
        {sentence}
      </p>

      {profile ? (
        <>
          <div className={`mt-8 ${boxClass}`}>
            <p className="text-lead font-medium">Pay {amount}</p>
            <p className={`mt-2 text-body ${noteClass}`}>Bank transfer or PayID</p>
            <p className="mt-4 text-lead font-medium">[YOUR BANK / PAYID DETAILS]</p>
            <p className={`mt-4 text-body ${noteClass}`}>
              Reference: {profile.business_name} · ABN {profile.abn}
            </p>
          </div>
          <p className={`mt-6 text-body ${noteClass}`}>
            We activate your account within 1 business day.
          </p>
        </>
      ) : (
        <Link
          to="/join"
          className="mt-8 inline-flex min-h-[52px] items-center rounded-none bg-ink px-8 text-lead font-medium text-paper transition-transform duration-150 active:scale-[0.97]"
        >
          Start your application
        </Link>
      )}
    </div>
  );
}