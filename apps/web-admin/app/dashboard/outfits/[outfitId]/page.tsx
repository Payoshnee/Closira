import { CalendarPlus } from "lucide-react";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { WardrobeImage } from "@/components/wardrobe/wardrobe-image";
import { duplicateOutfit, toggleOutfitFavorite } from "@/lib/actions/outfits";
import { getOutfit } from "@/lib/api/outfits";

export default async function OutfitDetailPage({ params }: { params: Promise<{ outfitId: string }> }) {
  const { outfitId } = await params;
  const outfit = await getOutfit(outfitId);

  if (!outfit) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Badge>{outfit.occasion}</Badge>
          <h1 className="mt-3 text-3xl font-bold text-charcoal">{outfit.name}</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-600">{outfit.notes}</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <ButtonLink href={`/dashboard/outfits/${outfit.id}/edit`} variant="secondary">Edit outfit</ButtonLink>
          <form action={toggleOutfitFavorite.bind(null, outfit.id, outfit.isFavorite)}>
            <button className="inline-flex min-h-11 w-full items-center justify-center rounded-lg border border-stone-300 bg-white px-5 py-2.5 text-sm font-semibold text-charcoal hover:bg-ivory-100" type="submit">
              {outfit.isFavorite ? "Remove favorite" : "Favorite"}
            </button>
          </form>
          <form action={duplicateOutfit.bind(null, outfit.id)}>
            <button className="inline-flex min-h-11 w-full items-center justify-center rounded-lg border border-stone-300 bg-white px-5 py-2.5 text-sm font-semibold text-charcoal hover:bg-ivory-100" type="submit">
              Duplicate
            </button>
          </form>
          <ButtonLink href="/dashboard/calendar/new"><CalendarPlus className="mr-2 h-4 w-4" aria-hidden="true" /> Plan it</ButtonLink>
        </div>
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        {outfit.items.map((item) => (
          <Card key={item.id} className="overflow-hidden">
            <WardrobeImage
              src={item.wardrobeItem.images[0]?.url}
              alt={item.wardrobeItem.images[0]?.alt ?? item.wardrobeItem.title}
              gradient={item.wardrobeItem.images[0]?.gradient}
              className="aspect-[4/5] p-4"
            />
            <div className="p-4">
              <Badge>{item.slot}</Badge>
              <h2 className="mt-3 font-semibold text-charcoal">{item.wardrobeItem.title}</h2>
              <p className="mt-1 text-sm text-stone-600">{item.wardrobeItem.primaryColor} · {item.wardrobeItem.material}</p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
