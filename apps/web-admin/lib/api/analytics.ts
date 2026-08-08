import { mockWardrobeAnalytics } from "@/lib/mock/analytics";
import type { WardrobeAnalytics } from "@/types/analytics";

export async function getWardrobeAnalytics(): Promise<WardrobeAnalytics> {
  // TODO: Replace mock adapter with GET /analytics/wardrobe, /analytics/usage, and /analytics/cost-per-wear once implemented.
  return mockWardrobeAnalytics;
}
