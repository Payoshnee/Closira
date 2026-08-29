import { apiGet } from "@/lib/api/client";
import type { ShoppingAssistantCheck } from "@/types/ai";

export async function listShoppingAssistantChecks(): Promise<ShoppingAssistantCheck[]> {
  const result = await apiGet<ShoppingAssistantCheck[]>("/ai/shopping-checks");
  return result.data ?? [];
}
