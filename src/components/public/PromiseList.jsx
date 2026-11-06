const PROMISES = [
  {
    title: "See the factory",
    body: "Our own footage of the floor, the line and the people, filmed on the visit that got them listed.",
  },
  {
    title: "Touch the product",
    body: "A real unit, sent from a hub in Australia. Your first sample is free and yours to keep.",
  },
  {
    title: "Order with confidence",
    body: "Every bulk order is locked to the sample you approved, so the carton matches what you held.",
  },
];

export default function PromiseList() {
  return (
    <section className="mx-auto w-full max-w-[1180px] px-5 py-14 md:px-10 md:py-20">
      <h2 className="text-section font-medium tracking-[-0.02em]">What membership gives you</h2>
      <div className="mt-8 grid gap-3 md:grid-cols-3 md:gap-4">
        {PROMISES.map((promise) => (
          <div key={promise.title} className="bg-paper p-6 md:p-7">
            <h3 className="text-lead font-medium">{promise.title}</h3>
            <p className="mt-3 text-body text-ink-soft">{promise.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}