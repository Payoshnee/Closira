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

