import { apiGet } from "@/lib/api/client";
import { mockOutfitSummary, mockOutfits } from "@/lib/mock/outfits";
import type { Outfit, OutfitFilters, OutfitSummary } from "@/types/outfits";

export async function listOutfits(filters: OutfitFilters = {}): Promise<Outfit[]> {
  const params = new URLSearchParams();
  if (filters.q) params.set("q", filters.q);
  if (filters.occasion) params.set("occasion", filters.occasion);
  if (filters.favorite) params.set("favorite", "true");
  const result = await apiGet<Outfit[]>(`/outfits${params.size ? `?${params.toString()}` : ""}`);
  return result.data ?? fallbackOutfits(filters);
}

export async function getOutfit(id: string): Promise<Outfit | null> {
  const result = await apiGet<Outfit>(`/outfits/${id}`);
  return result.data ?? mockOutfits.find((outfit) => outfit.id === id) ?? null;
}

export async function getOutfitSummary(): Promise<OutfitSummary> {
  const result = await apiGet<OutfitSummary>("/outfits/summary");
  return result.data ?? mockOutfitSummary;
}

function fallbackOutfits(filters: OutfitFilters = {}) {
  return mockOutfits.filter((outfit) => {
    const matchesQuery = filters.q ? outfit.name.toLowerCase().includes(filters.q.toLowerCase()) : true;
    const matchesOccasion = filters.occasion ? outfit.occasion === filters.occasion : true;
    const matchesFavorite = filters.favorite ? outfit.isFavorite : true;
    return matchesQuery && matchesOccasion && matchesFavorite;
  });
}
