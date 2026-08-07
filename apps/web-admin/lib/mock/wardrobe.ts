import type { Category, Tag, WardrobeItem, WardrobeSummary } from "@/types/wardrobe";

export const mockCategories: Category[] = [
  { id: "cat-traditional", name: "Traditional Wear", slug: "traditional-wear", itemCount: 18, isDefault: true, sortOrder: 1 },
  { id: "cat-western", name: "Western Wear", slug: "western-wear", itemCount: 24, isDefault: true, sortOrder: 2 },
  { id: "cat-formal", name: "Formal Wear", slug: "formal-wear", itemCount: 11, isDefault: true, sortOrder: 3 },
  { id: "cat-footwear", name: "Footwear", slug: "footwear", itemCount: 9, isDefault: true, sortOrder: 4 },
  { id: "cat-accessories", name: "Accessories", slug: "accessories", itemCount: 16, isDefault: true, sortOrder: 5 }
];

export const mockTags: Tag[] = [
  { id: "tag-work", type: "occasion", name: "Office", slug: "office", itemCount: 14, isDefault: true },
  { id: "tag-wedding", type: "occasion", name: "Wedding", slug: "wedding", itemCount: 8, isDefault: true },
  { id: "tag-summer", type: "season", name: "Summer", slug: "summer", itemCount: 22, isDefault: true },
  { id: "tag-festive", type: "style", name: "Festive", slug: "festive", itemCount: 10, isDefault: true },
  { id: "tag-capsule", type: "custom", name: "Capsule", slug: "capsule", itemCount: 7, isDefault: false }
];

export const mockWardrobeItems: WardrobeItem[] = [
  {
    id: "item-rose-sari",
    title: "Rose silk sari",
    categoryId: "cat-traditional",
    categoryName: "Traditional Wear",
    primaryColor: "Rose",
    secondaryColors: ["Gold", "Ivory"],
    material: "Silk",
    pattern: "Woven border",
    brand: "Handloom edit",
    purchasePrice: 240,
    currency: "USD",
    size: "Free size",
    condition: "excellent",
    season: "Festive",
    usageCount: 3,
    lastWornAt: "2026-05-19",
    storageLocation: "Occasion wardrobe",
    notes: "Best with gold clutch and pearl heels.",
    isFavorite: true,
    tags: [mockTags[1], mockTags[3]],
    images: [{ id: "img-rose-sari", imageType: "front", alt: "Rose silk sari", gradient: "from-rose-200 via-ivory-100 to-champagne" }]
  },
  {
    id: "item-linen-blazer",
    title: "Ivory linen blazer",
    categoryId: "cat-formal",
    categoryName: "Formal Wear",
    primaryColor: "Ivory",
    secondaryColors: ["Stone"],
    material: "Linen",
    pattern: "Solid",
    brand: "Closet Studio",
    purchasePrice: 128,
    currency: "USD",
    size: "M",
    condition: "good",
    season: "Summer",
    usageCount: 9,
    lastWornAt: "2026-07-21",
    storageLocation: "Work rail",
    notes: "Light enough for warm office days.",
    isFavorite: true,
    tags: [mockTags[0], mockTags[2], mockTags[4]],
    images: [{ id: "img-linen-blazer", imageType: "front", alt: "Ivory linen blazer", gradient: "from-ivory-100 via-white to-sage/50" }]
  },
  {
    id: "item-wide-trousers",
    title: "Charcoal wide-leg trousers",
    categoryId: "cat-western",
    categoryName: "Western Wear",
    primaryColor: "Charcoal",
    secondaryColors: ["Black"],
    material: "Viscose blend",
    pattern: "Solid",
    brand: "Modern Form",
    purchasePrice: 86,
    currency: "USD",
    size: "M",
    condition: "excellent",
    season: "All season",
    usageCount: 14,
    lastWornAt: "2026-08-01",
    storageLocation: "Everyday rail",
    notes: "High rewear value. Works with most tops.",
    isFavorite: false,
    tags: [mockTags[0], mockTags[4]],
    images: [{ id: "img-wide-trousers", imageType: "front", alt: "Charcoal wide-leg trousers", gradient: "from-stone-700 via-charcoal to-stone-500" }]
  },
  {
    id: "item-pearl-heels",
    title: "Pearl block heels",
    categoryId: "cat-footwear",
    categoryName: "Footwear",
    primaryColor: "Pearl",
    secondaryColors: ["Champagne"],
    material: "Satin",
    pattern: "Embellished",
    brand: "Evening Pair",
    purchasePrice: 112,
    currency: "USD",
    size: "8",
    condition: "new",
    season: "Occasion",
    usageCount: 0,
    lastWornAt: null,
    storageLocation: "Shoe shelf",
    notes: "Never worn. Pair with sari or blazer looks.",
    isFavorite: false,
    tags: [mockTags[1], mockTags[3]],
    images: [{ id: "img-pearl-heels", imageType: "front", alt: "Pearl block heels", gradient: "from-white via-ivory-100 to-champagne" }]
  },
  {
    id: "item-gold-clutch",
    title: "Gold evening clutch",
    categoryId: "cat-accessories",
    categoryName: "Accessories",
    primaryColor: "Gold",
    secondaryColors: ["Champagne"],
    material: "Metal mesh",
    pattern: "Textured",
    brand: "Occasion House",
    purchasePrice: 74,
    currency: "USD",
    size: "One size",
    condition: "excellent",
    season: "Festive",
    usageCount: 5,
    lastWornAt: "2026-06-12",
    storageLocation: "Accessory drawer",
    notes: "Compact but fits essentials.",
    isFavorite: true,
    tags: [mockTags[1], mockTags[3]],
    images: [{ id: "img-gold-clutch", imageType: "front", alt: "Gold evening clutch", gradient: "from-yellow-100 via-champagne to-rose-100" }]
  }
];

export const mockWardrobeSummary: WardrobeSummary = {
  totalItems: mockWardrobeItems.length,
  favoriteItems: mockWardrobeItems.filter((item) => item.isFavorite).length,
  neverWornItems: mockWardrobeItems.filter((item) => item.usageCount === 0).length,
  totalValue: mockWardrobeItems.reduce((sum, item) => sum + item.purchasePrice, 0),
  mostUsedCategory: "Western Wear"
};

