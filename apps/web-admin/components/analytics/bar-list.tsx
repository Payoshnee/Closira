import { Card } from "@/components/ui/card";
import type { AnalyticsSlice } from "@/types/analytics";

export function BarList({ title, slices }: { title: string; slices: AnalyticsSlice[] }) {
  const max = Math.max(...slices.map((slice) => slice.value), 1);

  return (
    <Card className="p-5">
      <h2 className="text-lg font-bold text-charcoal">{title}</h2>
      <div className="mt-5 space-y-4">
        {slices.map((slice) => (
          <div key={slice.label}>
            <div className="flex justify-between gap-3 text-sm">
              <span className="font-semibold text-charcoal">{slice.label}</span>
              <span className="text-stone-600">{slice.value}</span>
            </div>
            <div className="mt-2 h-2 rounded-full bg-stone-200">
              <div className="h-2 rounded-full bg-rose-500" style={{ width: `${(slice.value / max) * 100}%` }} />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

