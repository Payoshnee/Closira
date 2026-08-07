export type WardrobeImage = {
  id: string;
  imageType: "front" | "back" | "close_up";
  alt: string;
  gradient: string;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  itemCount: number;
  isDefault: boolean;
  sortOrder: number;
};

export type TagType = "occasion" | "season" | "style" | "custom";

export type Tag = {
  id: string;
  type: TagType;
  name: string;
  slug: string;
  itemCount: number;
  isDefault: boolean;
};

export type WardrobeItem = {
  id: string;
  title: string;
  categoryId: string;
  categoryName: string;
  primaryColor: string;
  secondaryColors: string[];
  material: string;
  pattern: string;
  brand: string;
  purchasePrice: number;
  currency: string;
  size: string;
  condition: "new" | "excellent" | "good" | "needs-care";
  season: string;
  usageCount: number;
  lastWornAt: string | null;
  storageLocation: string;
  notes: string;
  isFavorite: boolean;
  tags: Tag[];
  images: WardrobeImage[];
};

export type WardrobeFilters = {
  q?: string;
  categoryId?: string;
  tagId?: string;
  favorite?: boolean;
  neverWorn?: boolean;
};

export type WardrobeSummary = {
  totalItems: number;
  favoriteItems: number;
  neverWornItems: number;
  totalValue: number;
  mostUsedCategory: string;
};

