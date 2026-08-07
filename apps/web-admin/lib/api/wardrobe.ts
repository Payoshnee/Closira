import { mockWardrobeItems, mockWardrobeSummary } from "@/lib/mock/wardrobe";
import type { WardrobeFilters, WardrobeItem, WardrobeSummary } from "@/types/wardrobe";

export async function listWardrobeItems(filters: WardrobeFilters = {}): Promise<WardrobeItem[]> {
  // TODO: Replace mock adapter with GET /wardrobe/items once the NestJS endpoint is implemented.
  return mockWardrobeItems.filter((item) => {
    const matchesQuery = filters.q ? item.title.toLowerCase().includes(filters.q.toLowerCase()) : true;
    const matchesCategory = filters.categoryId ? item.categoryId === filters.categoryId : true;
    const matchesTag = filters.tagId ? item.tags.some((tag) => tag.id === filters.tagId) : true;
    const matchesFavorite = filters.favorite ? item.isFavorite : true;
    const matchesNeverWorn = filters.neverWorn ? item.usageCount === 0 : true;

    return matchesQuery && matchesCategory && matchesTag && matchesFavorite && matchesNeverWorn;
  });
}

export async function getWardrobeItem(id: string): Promise<WardrobeItem | null> {
  // TODO: Replace mock adapter with GET /wardrobe/items/:id once the NestJS endpoint is implemented.
  return mockWardrobeItems.find((item) => item.id === id) ?? null;
}

export async function getWardrobeSummary(): Promise<WardrobeSummary> {
  // TODO: Replace mock adapter with GET /analytics/wardrobe once the analytics endpoint is implemented.
  return mockWardrobeSummary;
}
