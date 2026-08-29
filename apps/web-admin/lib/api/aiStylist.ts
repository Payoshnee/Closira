import { apiGet, apiPost } from "@/lib/api/client";
import type { AiProviderSettings, AiProviderSettingsInput, AiStylistRecommendation, ClothingAnalysisResult, SimilarWardrobeResult } from "@/types/ai";

export async function listAiStylistRecommendations(): Promise<AiStylistRecommendation[]> {
  const result = await apiGet<AiStylistRecommendation[]>("/ai/recommendations");
  return result.data ?? [];
}

export async function recommendOutfit(prompt: string): Promise<AiStylistRecommendation | null> {
  const result = await apiPost<AiStylistRecommendation, { prompt: string }>("/ai/recommend-outfit", { prompt });
  return result.data ?? null;
}

export async function getAiProviderSettings(): Promise<AiProviderSettings | null> {
  const result = await apiGet<AiProviderSettings>("/ai/settings");
  return result.data ?? null;
}

export async function updateAiProviderSettings(body: AiProviderSettingsInput): Promise<AiProviderSettings | null> {
  const result = await apiPost<AiProviderSettings, AiProviderSettingsInput>("/ai/settings", body);
  return result.data ?? null;
}

export async function analyzeWardrobeItem(itemId: string): Promise<ClothingAnalysisResult | null> {
  const result = await apiPost<ClothingAnalysisResult, Record<string, never>>(`/ai/items/${itemId}/analyze`, {});
  return result.data ?? null;
}

export async function embedWardrobeItem(itemId: string): Promise<{ dimensions: number; model: string } | null> {
  const result = await apiPost<{ dimensions: number; model: string }, Record<string, never>>(`/ai/items/${itemId}/embed`, {});
  return result.data ?? null;
}

export async function listSimilarWardrobeItems(itemId: string): Promise<SimilarWardrobeResult[]> {
  const result = await apiGet<SimilarWardrobeResult[]>(`/ai/items/${itemId}/similar`);
  return result.data ?? [];
}
