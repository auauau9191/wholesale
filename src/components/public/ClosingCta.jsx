import { Link } from "@tanstack/react-router";

export default function ClosingCta() {
  return (
    <section className="mx-auto w-full max-w-[1180px] px-5 py-16 md:px-10 md:py-24">
      <h2 className="text-giant font-medium tracking-[-0.035em]">Then order it.</h2>
      <p className="mt-6 max-w-[560px] text-lead text-ink-soft">
        Membership opens with an ABN check. One free sample per ABN, for life.
      </p>
      <div className="mt-8">
        <Link
          to="/join"
          className="inline-flex min-h-[52px] items-center rounded-none bg-ink px-8 text-lead font-medium text-paper underline-offset-4 hover:underline"
        >
          See the plans
        </Link>
      </div>
    </section>
  );
}