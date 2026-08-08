import { ButtonLink } from "@/components/ui/button";
import { OutfitGrid, OutfitStatGrid } from "@/components/outfits";
import { getOutfitSummary, listOutfits } from "@/lib/api/outfits";
import type { OutfitFilters } from "@/types/outfits";

export default async function OutfitsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const filters: OutfitFilters = {
    q: typeof params.q === "string" ? params.q : undefined,
    occasion: typeof params.occasion === "string" ? params.occasion : undefined
  };
  const [summary, outfits] = await Promise.all([getOutfitSummary(), listOutfits(filters)]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-rose-700">Outfits</p>
          <h1 className="mt-2 text-3xl font-bold text-charcoal">Outfit builder</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-600">Create reusable outfit combinations from wardrobe items and prepare them for planning.</p>
        </div>
        <ButtonLink href="/dashboard/outfits/new" variant="secondary">Create outfit</ButtonLink>
      </div>
      <OutfitStatGrid summary={summary} />
      <OutfitGrid outfits={outfits} />
    </div>
  );
}

