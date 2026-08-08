import type { WardrobeAnalytics } from "@/types/analytics";

export const mockWardrobeAnalytics: WardrobeAnalytics = {
  metrics: [
    { label: "Wardrobe value", value: "$640", detail: "Tracked from item purchase metadata" },
    { label: "Average cost per wear", value: "$19.39", detail: "Across worn items only" },
    { label: "Unused items", value: "1", detail: "Never worn or missing usage history" },
    { label: "Reuse score", value: "72%", detail: "Based on wear distribution and favorites" }
  ],
  categoryBreakdown: [
    { label: "Western Wear", value: 24 },
    { label: "Traditional Wear", value: 18 },
    { label: "Accessories", value: 16 },
    { label: "Formal Wear", value: 11 },
    { label: "Footwear", value: 9 }
  ],
  usageBreakdown: [
    { label: "High rotation", value: 2 },
    { label: "Occasion only", value: 2 },
    { label: "Never worn", value: 1 }
  ],
  colorBreakdown: [
    { label: "Ivory", value: 2 },
    { label: "Rose", value: 1 },
    { label: "Charcoal", value: 1 },
    { label: "Gold", value: 1 }
  ]
};

