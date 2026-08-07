import { EmptyState } from "@/components/ui/states";
import { WardrobeCard } from "@/components/wardrobe/wardrobe-card";
import type { WardrobeItem } from "@/types/wardrobe";

export function WardrobeGrid({ items }: { items: WardrobeItem[] }) {
  if (items.length === 0) {
    return <EmptyState title="No wardrobe items found" description="Adjust filters or add your first item when uploads are connected." />;
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
      {items.map((item) => (
        <WardrobeCard key={item.id} item={item} />
      ))}
    </div>
  );
}

