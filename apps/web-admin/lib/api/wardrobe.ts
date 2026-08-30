import { mockWardrobeItems, mockWardrobeSummary } from "@/lib/mock/wardrobe";
import { apiGet, apiPost } from "@/lib/api/client";
import type { WardrobeFilters, WardrobeItem, WardrobeSummary, WardrobeUploadUrl } from "@/types/wardrobe";

type WardrobeListResponse = {
  items: WardrobeItem[];
  total: number;
  page: number;
  pageSize: number;
};

export async function listWardrobeItems(filters: WardrobeFilters = {}): Promise<WardrobeItem[]> {
  const params = new URLSearchParams();
  if (filters.q) params.set("q", filters.q);
  if (filters.categoryId) params.set("categoryId", filters.categoryId);
  if (filters.tagId) params.set("tagId", filters.tagId);
  if (filters.favorite) params.set("favorite", "true");
  if (filters.neverWorn) params.set("neverWorn", "true");

  const query = params.toString();
  const result = await apiGet<WardrobeListResponse>(`/wardrobe/items${query ? `?${query}` : ""}`);
  return result.data?.items.map(withPrivateImageUrls) ?? fallbackWardrobeItems(filters);
}

export async function getWardrobeItem(id: string): Promise<WardrobeItem | null> {
  const result = await apiGet<WardrobeItem>(`/wardrobe/items/${id}`);
  return result.data ? withPrivateImageUrls(result.data) : mockWardrobeItems.find((item) => item.id === id) ?? null;
}

export async function getWardrobeSummary(): Promise<WardrobeSummary> {
  const result = await apiGet<WardrobeSummary>("/wardrobe/summary");
  return result.data ?? mockWardrobeSummary;
}

export async function createWardrobeUploadUrl(itemId: string, body: { fileName: string; contentType: string; byteSize: number }): Promise<WardrobeUploadUrl | null> {
  const result = await apiPost<WardrobeUploadUrl, typeof body>(`/wardrobe/items/${itemId}/upload-url`, body);
  return result.data ?? null;
}

function fallbackWardrobeItems(filters: WardrobeFilters = {}) {
  return mockWardrobeItems.filter((item) => {
    const matchesQuery = filters.q ? item.title.toLowerCase().includes(filters.q.toLowerCase()) : true;
    const matchesCategory = filters.categoryId ? item.categoryId === filters.categoryId : true;
    const matchesTag = filters.tagId ? item.tags.some((tag) => tag.id === filters.tagId) : true;
    const matchesFavorite = filters.favorite ? item.isFavorite : true;
    const matchesNeverWorn = filters.neverWorn ? item.usageCount === 0 : true;

    return matchesQuery && matchesCategory && matchesTag && matchesFavorite && matchesNeverWorn;
  });
}

function withPrivateImageUrls(item: WardrobeItem): WardrobeItem {
  return {
    ...item,
    images: item.images.map((image) => ({
      ...image,
      url: `/api/wardrobe/items/${item.id}/images/${image.id}/read`
    }))
  };
}
