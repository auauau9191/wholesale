/** Loading state for the plan cards: flat grey bars at the size the rows take. */
export default function PlanLoading() {
  return (
    <div className="grid gap-3 md:grid-cols-2 md:gap-4">
      {["one", "two"].map((key) => (
        <div key={key} className="bg-surface p-6 md:p-8" aria-busy="true">
          <div className="h-[20px] w-[46%] rounded-full bg-ground" />
          <div className="mt-5 h-[14px] w-[86%] rounded-full bg-ground" />
          <div className="mt-2 h-[14px] w-[62%] rounded-full bg-ground" />
        </div>
      ))}
    </div>
  );
}