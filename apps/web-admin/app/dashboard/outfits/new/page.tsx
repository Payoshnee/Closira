import { OutfitEditor } from "@/components/outfits";
import { listWardrobeItems } from "@/lib/api/wardrobe";

export default async function NewOutfitPage() {
  const wardrobeItems = await listWardrobeItems();

  return <OutfitEditor wardrobeItems={wardrobeItems} />;
}

