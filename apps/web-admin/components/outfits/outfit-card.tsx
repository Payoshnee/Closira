import { CalendarPlus, Heart } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { Outfit } from "@/types/outfits";

export function OutfitCard({ outfit }: { outfit: Outfit }) {
  return (
    <Link href={`/dashboard/outfits/${outfit.id}`} className="group block focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-rose-500">
      <Card className="overflow-hidden transition group-hover:-translate-y-0.5 group-hover:shadow-soft">
        <div className="grid aspect-[5/3] grid-cols-3 gap-2 bg-ivory-100 p-3">
          {outfit.items.slice(0, 3).map((item) => (
            <div key={item.id} className={`rounded-lg bg-gradient-to-br ${item.wardrobeItem.images[0]?.gradient ?? "from-ivory-100 to-rose-100"}`} />
          ))}
        </div>
        <div className="p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <Badge>{outfit.occasion}</Badge>
              <h3 className="mt-3 text-lg font-semibold text-charcoal">{outfit.name}</h3>
            </div>
            {outfit.isFavorite ? <Heart className="h-5 w-5 fill-rose-500 text-rose-700" aria-label="Favorite outfit" /> : null}
          </div>
          <p className="mt-2 text-sm leading-6 text-stone-600">{outfit.notes}</p>
          <div className="mt-5 flex items-center justify-between text-xs font-semibold text-stone-500">
            <span>{outfit.items.length} items</span>
            <span className="inline-flex items-center gap-1"><CalendarPlus className="h-4 w-4" aria-hidden="true" /> {outfit.usageCount} wears</span>
          </div>
        </div>
      </Card>
    </Link>
  );
}

