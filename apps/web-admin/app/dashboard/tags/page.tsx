import { TaxonomyTable } from "@/components/wardrobe";
import { TaxonomyEditor } from "@/components/wardrobe/taxonomy-editor";
import { listTags } from "@/lib/api/tags";

export default async function TagsPage() {
  const tags = await listTags();

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-rose-700">Tags</p>
        <h1 className="mt-2 text-3xl font-bold text-charcoal">Wardrobe tags</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-600">Organize occasions, seasons, styles, and custom labels for more precise wardrobe decisions.</p>
      </div>
      <TaxonomyEditor mode="tag" />
      <TaxonomyTable title="Tags" items={tags} />
    </div>
  );
}
