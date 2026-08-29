import { Controller, Get } from "@nestjs/common";

@Controller("analytics")
export class AnalyticsController {
  @Get("wardrobe")
  getWardrobeAnalytics() {
    return {
      metrics: [
        { label: "Wardrobe value", value: "$640", detail: "Calculated from tracked item purchase metadata" },
        { label: "Average cost per wear", value: "$19.39", detail: "Derived from usage counts and purchase prices" },
        { label: "Unused items", value: "1", detail: "Items with no recorded wear history" },
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
  }
}

