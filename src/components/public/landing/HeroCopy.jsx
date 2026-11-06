import { Link } from "@tanstack/react-router";

/** The hero: the claim, the promise, and the one button. */
export default function HeroCopy({ price }) {
  return (
    <div className="max-w-[540px]">
      <h1 className="text-[40px] font-medium leading-[1.02] tracking-[-0.03em] md:text-[64px] md:leading-[0.98]">
        Hold the sample,
        <br />
        then order 5,000.
      </h1>
      <p className="mt-5 max-w-[520px] text-lead leading-[26px] md:mt-7 md:text-[30px] md:leading-[36px]">
        Chinese factories our team has visited and filmed. Their samples, already on a
        shelf in Australia.
      </p>
      <Link
        to="/join"
        className="mt-7 flex min-h-[52px] w-full items-center justify-center bg-ink px-8 text-lead font-medium text-ground transition-transform duration-150 active:scale-[0.97] md:mt-9 md:inline-flex md:w-auto"
      >
        Join for A${price}
      </Link>
    </div>
  );
}