import { mockShoppingChecks } from "@/lib/mock/ai";
import type { ShoppingAssistantCheck } from "@/types/ai";

export async function listShoppingAssistantChecks(): Promise<ShoppingAssistantCheck[]> {
  // TODO: Replace mock adapter with POST /ai/shopping-check once the AI endpoint is implemented.
  return mockShoppingChecks;
}
