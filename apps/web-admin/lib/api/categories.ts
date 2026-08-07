import { mockCategories } from "@/lib/mock/wardrobe";
import type { Category } from "@/types/wardrobe";

export async function listCategories(): Promise<Category[]> {
  // TODO: Replace mock adapter with GET /categories once the NestJS endpoint is implemented.
  return [...mockCategories].sort((a, b) => a.sortOrder - b.sortOrder);
}
