import { WardrobeEditor } from "@/components/wardrobe/wardrobe-editor";
import { listCategories } from "@/lib/api/categories";
import { listTags } from "@/lib/api/tags";

export default async function NewWardrobeItemPage() {
  const [categories, tags] = await Promise.all([listCategories(), listTags()]);

  return <WardrobeEditor title="Add wardrobe item" description="Create item metadata now. Image upload will connect to signed upload APIs when the backend endpoint is implemented." categories={categories} tags={tags} />;
}

