import { Heart, PackageCheck, Repeat2, WalletCards } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { WardrobeSummary } from "@/types/wardrobe";

export function WardrobeStatGrid({ summary }: { summary: WardrobeSummary }) {
  const stats = [
    { label: "Total items", value: summary.totalItems, icon: PackageCheck },
    { label: "Favorites", value: summary.favoriteItems, icon: Heart },
    { label: "Never worn", value: summary.neverWornItems, icon: Repeat2 },
    { label: "Tracked value", value: `$${summary.totalValue}`, icon: WalletCards }
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.label} className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-stone-600">{stat.label}</span>
              <Icon className="h-4 w-4 text-rose-700" aria-hidden="true" />
            </div>
            <p className="mt-4 text-3xl font-bold text-charcoal">{stat.value}</p>
          </Card>
        );
      })}
    </div>
  );
}

