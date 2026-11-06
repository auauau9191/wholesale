import { formatDate } from "@/lib/format";
import { PLAN_LABEL } from "@/lib/membership";

function Row({ label, value }) {
  return (
    <div className="flex items-baseline justify-between gap-6 border-t border-rule py-3 first:border-t-0 first:pt-0">
      <span className="text-body text-app-meta">{label}</span>
      <span className="text-right text-body text-app-ink">{value}</span>
    </div>
  );
}

export default function AccountSummary({ profile, settings }) {
  const monthly = settings?.monthly_price_aud;
  const annual = settings?.annual_price_aud;

  let priceLine = "—";
  if (profile.paid_until) {
    priceLine =
      profile.plan === "annual"
        ? `A$${annual} a year from ${formatDate(profile.paid_until)}`
        : `A$${monthly} a month from ${formatDate(profile.paid_until)}`;
  }

  return (
    <section className="rounded-card border border-edge bg-sheet p-5">
      <Row label="Business" value={profile.business_name} />
      <Row label="ABN" value={profile.abn} />
      <Row label="Plan" value={PLAN_LABEL[profile.plan] ?? "Member"} />
      <Row label="Paid until" value={formatDate(profile.paid_until)} />
      <Row label="Price from" value={priceLine} />
      <Row
        label="Delivery"
        value={`${profile.street}, ${profile.suburb} ${profile.state} ${profile.postcode}`}
      />
    </section>
  );
}