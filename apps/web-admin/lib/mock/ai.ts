import { mockWardrobeItems } from "@/lib/mock/wardrobe";
import type { AiStylistRecommendation, ShoppingAssistantCheck } from "@/types/ai";

const byId = new Map(mockWardrobeItems.map((item) => [item.id, item]));
const pick = (id: string) => {
  const item = byId.get(id);
  if (!item) throw new Error(`Missing mock wardrobe item ${id}`);
  return item;
};

export const mockAiRecommendations: AiStylistRecommendation[] = [
  {
    id: "ai-dinner-polish",
    prompt: "What should I wear for dinner on Friday?",
    title: "Soft formal dinner look",
    confidence: 0.91,
    occasion: "Dinner",
    explanation: "Uses polished pieces you already own and brings the never-worn pearl heels into rotation.",
    items: [pick("item-linen-blazer"), pick("item-wide-trousers"), pick("item-pearl-heels")]
  },
  {
    id: "ai-wedding-rose",
    prompt: "Wedding guest outfit with rose tones",
    title: "Rose and champagne wedding guest",
    confidence: 0.87,
    occasion: "Wedding",
    explanation: "Matches festive tags, gold accents, and a comfortable shoe choice for longer events.",
    items: [pick("item-rose-sari"), pick("item-gold-clutch"), pick("item-pearl-heels")]
  }
];

export const mockShoppingChecks: ShoppingAssistantCheck[] = [
  {
    id: "shop-cream-blazer",
    itemName: "Cream oversized blazer",
    recommendation: "consider",
    compatibilityScore: 74,
    duplicateRisk: "medium",
    explanation: "You already own an ivory linen blazer, but this silhouette could work if it is heavier and more structured.",
    similarItems: [pick("item-linen-blazer")]
  },
  {
    id: "shop-silver-heels",
    itemName: "Silver strappy heels",
    recommendation: "skip",
    compatibilityScore: 48,
    duplicateRisk: "high",
    explanation: "The pearl block heels cover similar event use cases with better comfort and higher outfit compatibility.",
    similarItems: [pick("item-pearl-heels")]
  }
];

