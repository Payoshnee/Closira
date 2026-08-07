import { CalendarDays, Sparkles } from "lucide-react";

export function VisualMockup() {
  const wardrobe = ["Silk blouse", "Wide trousers", "Pearl heels", "Linen blazer", "Rose sari", "Gold clutch"];

  return (
    <div className="relative rounded-lg border border-stone-200 bg-white p-4 shadow-soft">
      <div className="grid gap-3 sm:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-lg bg-ivory-100 p-4">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm font-semibold text-charcoal">Wardrobe</p>
            <span className="rounded-full bg-white px-3 py-1 text-xs text-stone-600">126 items</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {wardrobe.map((item) => (
              <div key={item} className="aspect-[4/5] rounded-lg border border-white/70 bg-gradient-to-br from-rose-100 via-ivory-50 to-lavender/40 p-3">
                <div className="h-full rounded-md border border-white/70 bg-white/42 p-2 text-xs font-medium text-stone-700">
                  <span>{item}</span>
                  <div className="mt-auto h-12" />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-3">
          <div className="rounded-lg bg-charcoal p-5 text-white">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Sparkles className="h-4 w-4 text-champagne" aria-hidden="true" />
              AI suggestion
            </div>
            <p className="mt-4 text-2xl font-semibold leading-tight">Try the linen blazer with pearl heels for Friday dinner.</p>
            <p className="mt-3 text-sm leading-6 text-stone-300">Balanced for warm weather, semi-formal plans, and pieces you have not worn this month.</p>
          </div>
          <div className="rounded-lg border border-stone-200 bg-white p-5">
            <div className="flex items-center gap-2 text-sm font-semibold text-charcoal">
              <CalendarDays className="h-4 w-4 text-rose-700" aria-hidden="true" />
              Calendar plan
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs font-medium text-stone-600">
              {["Mon", "Wed", "Fri"].map((day) => (
                <div key={day} className="rounded-lg bg-ivory-100 p-3">
                  <p>{day}</p>
                  <p className="mt-2 text-charcoal">Styled</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
