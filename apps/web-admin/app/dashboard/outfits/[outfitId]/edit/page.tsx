import { notFound } from "next/navigation";
import { OutfitEditor } from "@/components/outfits";
import { getOutfit } from "@/lib/api/outfits";
import { listWardrobeItems } from "@/lib/api/wardrobe";

export default async function EditOutfitPage({ params }: { params: Promise<{ outfitId: string }> }) {
  const { outfitId } = await params;
  const [outfit, wardrobeItems] = await Promise.all([getOutfit(outfitId), listWardrobeItems()]);

  if (!outfit) {
    notFound();
  }

  return <OutfitEditor outfit={outfit} wardrobeItems={wardrobeItems} />;
}

