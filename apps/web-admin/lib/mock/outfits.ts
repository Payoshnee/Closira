import { mockWardrobeItems } from "@/lib/mock/wardrobe";
import type { Outfit, OutfitSummary } from "@/types/outfits";

const byId = new Map(mockWardrobeItems.map((item) => [item.id, item]));

function item(id: string) {
  const wardrobeItem = byId.get(id);
  if (!wardrobeItem) {
    throw new Error(`Missing mock wardrobe item ${id}`);
  }
  return wardrobeItem;
}

export const mockOutfits: Outfit[] = [
  {
    id: "outfit-friday-dinner",
    name: "Friday dinner polish",
    occasion: "Dinner",
    notes: "Soft formal look with enough shine for evening plans.",
    isFavorite: true,
    usageCount: 2,
    lastWornAt: "2026-07-26",
    items: [
      { id: "oi-linen-blazer", slot: "top", sortOrder: 1, wardrobeItem: item("item-linen-blazer") },
      { id: "oi-wide-trousers", slot: "bottom", sortOrder: 2, wardrobeItem: item("item-wide-trousers") },
      { id: "oi-pearl-heels", slot: "footwear", sortOrder: 3, wardrobeItem: item("item-pearl-heels") }
    ]
  },
  {
    id: "outfit-wedding-guest",
    name: "Wedding guest rose",
    occasion: "Wedding",
    notes: "Traditional look with gold accents and comfortable block heels.",
    isFavorite: true,
    usageCount: 1,
    lastWornAt: "2026-05-19",
    items: [
      { id: "oi-rose-sari", slot: "traditional", sortOrder: 1, wardrobeItem: item("item-rose-sari") },
      { id: "oi-gold-clutch", slot: "bag", sortOrder: 2, wardrobeItem: item("item-gold-clutch") },
      { id: "oi-pearl-heels-2", slot: "footwear", sortOrder: 3, wardrobeItem: item("item-pearl-heels") }
    ]
  },
  {
    id: "outfit-office-capsule",
    name: "Office capsule repeat",
    occasion: "Office",
    notes: "Reliable workday combination built from high rewear pieces.",
    isFavorite: false,
    usageCount: 5,
    lastWornAt: "2026-08-01",
    items: [
      { id: "oi-office-blazer", slot: "top", sortOrder: 1, wardrobeItem: item("item-linen-blazer") },
      { id: "oi-office-trousers", slot: "bottom", sortOrder: 2, wardrobeItem: item("item-wide-trousers") }
    ]
  }
];

export const mockOutfitSummary: OutfitSummary = {
  totalOutfits: mockOutfits.length,
  favoriteOutfits: mockOutfits.filter((outfit) => outfit.isFavorite).length,
  plannedThisWeek: 2,
  mostUsedOccasion: "Office"
};

