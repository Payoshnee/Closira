import { OutfitCard } from "@/components/outfits/outfit-card";
import { EmptyState } from "@/components/ui/states";
import type { Outfit } from "@/types/outfits";

export function OutfitGrid({ outfits }: { outfits: Outfit[] }) {
  if (outfits.length === 0) {
    return <EmptyState title="No outfits found" description="Adjust filters or create an outfit from wardrobe pieces." />;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {outfits.map((outfit) => (
        <OutfitCard key={outfit.id} outfit={outfit} />
      ))}
    </div>
  );
}

