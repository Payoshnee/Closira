import { ButtonLink } from "@/components/ui/button";
import { WardrobeFilters, WardrobeGrid, WardrobeStatGrid } from "@/components/wardrobe";
import { listCategories } from "@/lib/api/categories";
import { listTags } from "@/lib/api/tags";
import { getWardrobeSummary, listWardrobeItems } from "@/lib/api/wardrobe";
import type { WardrobeFilters as WardrobeFilterValues } from "@/types/wardrobe";

export default async function WardrobePage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const filters: WardrobeFilterValues = {
    q: typeof params.q === "string" ? params.q : undefined,
    categoryId: typeof params.categoryId === "string" ? params.categoryId : undefined,
    tagId: typeof params.tagId === "string" ? params.tagId : undefined
  };

  const [summary, categories, tags, items] = await Promise.all([
    getWardrobeSummary(),
    listCategories(),
    listTags(),
    listWardrobeItems(filters)
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-rose-700">Wardrobe</p>
          <h1 className="mt-2 text-3xl font-bold text-charcoal">Digital wardrobe</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-600">Search, filter, and inspect wardrobe items. Upload and edit actions are ready for API wiring in the backend implementation.</p>
        </div>
        <ButtonLink href="/dashboard/wardrobe/new" variant="secondary">Add item</ButtonLink>
      </div>
      <WardrobeStatGrid summary={summary} />
      <WardrobeFilters categories={categories} tags={tags} />
      <WardrobeGrid items={items} />
    </div>
  );
}

