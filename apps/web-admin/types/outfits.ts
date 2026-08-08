import type { WardrobeItem } from "@/types/wardrobe";

export type OutfitSlot = "top" | "bottom" | "traditional" | "footwear" | "jewelry" | "bag" | "makeup" | "accessory" | "other";

export type OutfitItem = {
  id: string;
  slot: OutfitSlot;
  sortOrder: number;
  wardrobeItem: WardrobeItem;
};

export type Outfit = {
  id: string;
  name: string;
  occasion: string;
  notes: string;
  isFavorite: boolean;
  usageCount: number;
  lastWornAt: string | null;
  items: OutfitItem[];
};

export type OutfitFilters = {
  q?: string;
  occasion?: string;
  favorite?: boolean;
};

export type OutfitSummary = {
  totalOutfits: number;
  favoriteOutfits: number;
  plannedThisWeek: number;
  mostUsedOccasion: string;
};

