import { apiGet } from "@/lib/api/client";
import { mockCategories } from "@/lib/mock/wardrobe";
import type { Category } from "@/types/wardrobe";

export async function listCategories(): Promise<Category[]> {
  const result = await apiGet<Category[]>("/categories");
  return result.data ?? [...mockCategories].sort((a, b) => a.sortOrder - b.sortOrder);
}
