import { Link } from "@tanstack/react-router";

/** Shown once staff have marked the deposit received and granted the credits. */
export default function CreditsUnlocked({ credits }) {
  return (
    <section className="rounded-card border border-data bg-pill-green p-5 text-pill-green-ink">
      <p className="text-body">
        You unlocked <span className="font-medium">{credits} free sample credits</span>, usable in any category.
        We'll message you at each production step.
      </p>
      <Link to="/browse" className="mt-3 inline-flex min-h-[44px] items-center font-medium underline underline-offset-4">
        Use a credit · browse categories
      </Link>
    </section>
  );
}