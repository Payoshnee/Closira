import { apiGet } from "@/lib/api/client";
import type { WardrobeAnalytics } from "@/types/analytics";

export async function getWardrobeAnalytics(): Promise<WardrobeAnalytics> {
  const result = await apiGet<WardrobeAnalytics>("/analytics/wardrobe");
  return result.data ?? { metrics: [], categoryBreakdown: [], usageBreakdown: [], colorBreakdown: [] };
}
