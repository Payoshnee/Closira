import { CalendarDays, Heart, Shirt, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { OutfitSummary } from "@/types/outfits";

export function OutfitStatGrid({ summary }: { summary: OutfitSummary }) {
  const stats = [
    { label: "Total outfits", value: summary.totalOutfits, icon: Shirt },
    { label: "Favorites", value: summary.favoriteOutfits, icon: Heart },
    { label: "Planned this week", value: summary.plannedThisWeek, icon: CalendarDays },
    { label: "Top occasion", value: summary.mostUsedOccasion, icon: Sparkles }
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.label} className="p-5">
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-medium text-stone-600">{stat.label}</span>
              <Icon className="h-4 w-4 text-rose-700" aria-hidden="true" />
            </div>
            <p className="mt-4 text-2xl font-bold text-charcoal">{stat.value}</p>
          </Card>
        );
      })}
    </div>
  );
}

