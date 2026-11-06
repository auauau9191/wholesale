import { Link } from "@tanstack/react-router";

export default function LandingHero() {
  return (
    <section className="mx-auto w-full max-w-[1180px] px-5 pb-14 pt-10 md:px-10 md:pb-20 md:pt-16">
      <h1 className="text-giant font-medium tracking-[-0.035em]">
        <span className="block">See it.</span>
        <span className="block">Touch it.</span>
        <span className="block">Then order it.</span>
      </h1>
      <p className="mt-8 max-w-[620px] text-lead text-ink-soft">
        Chinese factories visited and filmed by our own team. Real samples sent from our
        hubs in Brisbane and Sydney before you order a single carton.
      </p>
      <div className="mt-8">
        <Link
          to="/join"
          className="inline-flex min-h-[52px] items-center rounded-none bg-ink px-8 text-lead font-medium text-paper transition-transform duration-150 active:scale-[0.97]"
        >
          Join the platform
        </Link>
      </div>
    </section>
  );
}