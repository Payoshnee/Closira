import { mockOutfitSummary, mockOutfits } from "@/lib/mock/outfits";
import type { Outfit, OutfitFilters, OutfitSummary } from "@/types/outfits";

export async function listOutfits(filters: OutfitFilters = {}): Promise<Outfit[]> {
  // TODO: Replace mock adapter with GET /outfits once the NestJS endpoint is implemented.
  return mockOutfits.filter((outfit) => {
    const matchesQuery = filters.q ? outfit.name.toLowerCase().includes(filters.q.toLowerCase()) : true;
    const matchesOccasion = filters.occasion ? outfit.occasion === filters.occasion : true;
    const matchesFavorite = filters.favorite ? outfit.isFavorite : true;
    return matchesQuery && matchesOccasion && matchesFavorite;
  });
}

export async function getOutfit(id: string): Promise<Outfit | null> {
  // TODO: Replace mock adapter with GET /outfits/:id once the NestJS endpoint is implemented.
  return mockOutfits.find((outfit) => outfit.id === id) ?? null;
}

export async function getOutfitSummary(): Promise<OutfitSummary> {
  // TODO: Replace mock adapter with analytics-backed outfit summary once implemented.
  return mockOutfitSummary;
}
