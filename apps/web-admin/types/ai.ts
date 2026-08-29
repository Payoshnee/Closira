import type { WardrobeItem } from "@/types/wardrobe";

export type AiStylistRecommendation = {
  id: string;
  prompt: string;
  title: string;
  confidence: number;
  occasion: string;
  explanation: string;
  items: WardrobeItem[];
};

export type ShoppingAssistantCheck = {
  id: string;
  itemName: string;
  recommendation: "buy" | "skip" | "consider";
  compatibilityScore: number;
  duplicateRisk: "low" | "medium" | "high";
  explanation: string;
  similarItems: WardrobeItem[];
};

export type AiProvider = "native" | "openai" | "anthropic" | "gemini" | "azure-openai" | "ollama" | "custom";

export type AiProviderOption = {
  id: AiProvider;
  name: string;
  requiresApiKey: boolean;
  endpointLabel?: string;
};

export type AiProviderSettings = {
  activeProvider: AiProvider;
  nativeEnabled: boolean;
  connectedProviders: AiProvider[];
  supportedProviders: AiProviderOption[];
};

export type AiProviderSettingsInput = Partial<AiProviderSettings> & {
  provider?: AiProvider;
  apiKey?: string;
  baseUrl?: string;
  model?: string;
};

export type ClothingAnalysisResult = {
  detected_category: string;
  detected_colors: string[];
  suggested_tags: string[];
  confidence: number;
  fallback_used: boolean;
  model: string;
};

export type SimilarWardrobeResult = {
  item: WardrobeItem;
  similarity: number;
};
