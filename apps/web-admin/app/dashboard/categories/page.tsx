import { TaxonomyTable } from "@/components/wardrobe";
import { TaxonomyEditor } from "@/components/wardrobe/taxonomy-editor";
import { listCategories } from "@/lib/api/categories";

export default async function CategoriesPage() {
  const categories = await listCategories();

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-rose-700">Categories</p>
        <h1 className="mt-2 text-3xl font-bold text-charcoal">Wardrobe categories</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-600">Manage the category taxonomy that powers wardrobe filters and item creation.</p>
      </div>
      <TaxonomyEditor mode="category" />
      <TaxonomyTable title="Categories" items={categories} />
    </div>
  );
}

