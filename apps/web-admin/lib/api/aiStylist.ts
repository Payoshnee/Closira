import { mockAiRecommendations } from "@/lib/mock/ai";
import type { AiStylistRecommendation } from "@/types/ai";

export async function listAiStylistRecommendations(): Promise<AiStylistRecommendation[]> {
  // TODO: Replace mock adapter with POST /ai/recommend-outfit once the AI endpoint is implemented.
  return mockAiRecommendations;
}
