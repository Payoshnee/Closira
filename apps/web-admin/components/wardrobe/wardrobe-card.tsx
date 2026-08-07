import { Heart, Shirt } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { WardrobeItem } from "@/types/wardrobe";

export function WardrobeCard({ item }: { item: WardrobeItem }) {
  return (
    <Link href={`/dashboard/wardrobe/${item.id}`} className="group block focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-rose-500">
      <Card className="overflow-hidden transition group-hover:-translate-y-0.5 group-hover:shadow-soft">
        <div className={`aspect-[4/5] bg-gradient-to-br ${item.images[0]?.gradient ?? "from-ivory-100 to-rose-100"} p-4`}>
          <div className="flex h-full flex-col justify-between rounded-lg border border-white/60 bg-white/32 p-3">
            <div className="flex justify-between gap-2">
              <Badge className="bg-white/80">{item.categoryName}</Badge>
              {item.isFavorite ? <Heart className="h-5 w-5 fill-rose-500 text-rose-700" aria-label="Favorite" /> : null}
            </div>
            <Shirt className="h-10 w-10 text-charcoal/55" aria-hidden="true" />
          </div>
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-charcoal">{item.title}</h3>
          <p className="mt-1 text-sm text-stone-600">{item.primaryColor} · {item.material}</p>
          <div className="mt-4 flex items-center justify-between text-xs font-semibold text-stone-500">
            <span>{item.usageCount} wears</span>
            <span>{item.lastWornAt ?? "Never worn"}</span>
          </div>
        </div>
      </Card>
    </Link>
  );
}

