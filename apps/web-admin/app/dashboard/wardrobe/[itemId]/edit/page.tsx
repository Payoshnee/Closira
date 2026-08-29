import { notFound } from "next/navigation";
import { WardrobeEditor } from "@/components/wardrobe/wardrobe-editor";
import { listCategories } from "@/lib/api/categories";
import { listTags } from "@/lib/api/tags";
import { getWardrobeItem } from "@/lib/api/wardrobe";

export default async function EditWardrobeItemPage({ params }: { params: Promise<{ itemId: string }> }) {
  const { itemId } = await params;
  const [item, categories, tags] = await Promise.all([getWardrobeItem(itemId), listCategories(), listTags()]);

  if (!item) {
    notFound();
  }

  return <WardrobeEditor title="Edit wardrobe item" description="Update wardrobe metadata in the API-backed wardrobe." categories={categories} tags={tags} item={item} />;
}
